import { ATTACHMENT_CONFIG, type PublicUser, type ReportAttachment } from '@kcc/shared';
import { generateId, nowIso } from '../lib/db.js';
import { badRequest, forbidden, notFound } from '../lib/errors.js';
import { ReportRepository } from '../repositories/report.repository.js';
import {
  buildAttachmentObjectKey,
  type StorageAdapter,
  validateAttachmentFile,
} from '../storage/r2.storage.js';
import { canUploadAttachment, canViewReport } from './policy.service.js';

export class AttachmentService {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly storage: StorageAdapter,
  ) {}

  async uploadAttachment(params: {
    actor: PublicUser;
    reportId: string;
    originalFilename: string;
    declaredMimeType: string;
    fileBuffer: ArrayBuffer;
  }): Promise<ReportAttachment> {
    const report = await this.reportRepo.findById(params.reportId);
    if (!report) {
      throw notFound('Report not found');
    }
    if (!canUploadAttachment(params.actor, report)) {
      throw forbidden('You are not authorised to upload attachments to this report');
    }

    const currentCount = await this.reportRepo.countAttachments(report.id);
    if (currentCount >= ATTACHMENT_CONFIG.MAX_FILES_PER_REPORT) {
      throw badRequest(
        'ATTACHMENT_LIMIT_REACHED',
        `A maximum of ${ATTACHMENT_CONFIG.MAX_FILES_PER_REPORT} attachments is allowed per report`,
      );
    }

    const bytes = new Uint8Array(params.fileBuffer);
    const { contentType, extension } = validateAttachmentFile(bytes, params.declaredMimeType);
    const objectKey = buildAttachmentObjectKey(report.id, extension);

    await this.storage.putObject(objectKey, params.fileBuffer, contentType);

    const attachment: ReportAttachment & { objectKey: string } = {
      id: generateId('att'),
      reportId: report.id,
      uploadedBy: params.actor.id,
      objectKey,
      originalFilename: params.originalFilename.slice(0, 180),
      contentType,
      sizeBytes: bytes.byteLength,
      createdAt: nowIso(),
    };

    try {
      await this.reportRepo.createAttachment(attachment);
    } catch (err) {
      await this.storage.deleteObject(objectKey);
      throw err;
    }

    return {
      id: attachment.id,
      reportId: attachment.reportId,
      uploadedBy: attachment.uploadedBy,
      originalFilename: attachment.originalFilename,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes,
      createdAt: attachment.createdAt,
    };
  }

  async downloadAttachment(
    actor: PublicUser,
    reportId: string,
    attachmentId: string,
  ): Promise<{
    body: ReadableStream | ArrayBuffer;
    contentType: string;
    originalFilename: string;
  }> {
    const report = await this.reportRepo.findById(reportId);
    if (!report) throw notFound('Report not found');
    if (!canViewReport(actor, report)) {
      throw forbidden('You do not have access to this attachment');
    }

    const attachment = await this.reportRepo.findAttachmentById(attachmentId);
    if (!attachment || attachment.reportId !== report.id) {
      throw notFound('Attachment not found');
    }

    const object = await this.storage.getObject(attachment.objectKey);
    if (!object) {
      throw notFound('Attachment file is missing from storage');
    }

    return {
      body: object.body,
      contentType: attachment.contentType,
      originalFilename: attachment.originalFilename,
    };
  }
}
