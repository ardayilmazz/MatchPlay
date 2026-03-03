import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import GameSession from '../models/GameSession';
import User from '../models/User';
import mongoose from 'mongoose';

/**
 * Şikayet oluştur
 * POST /api/complaints
 */
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { gameSessionId, reportedId, message } = req.body;
    const reporterId = (req as any).user._id;

    console.log('[createComplaint] Şikayet oluşturuluyor:', { gameSessionId, reporterId, reportedId });

    // Oyunu kontrol et
    const gameSession = await GameSession.findById(gameSessionId);
    if (!gameSession) {
      return res.status(404).json({ success: false, message: 'Oyun bulunamadı' });
    }

    // Kullanıcı bu oyunda mı kontrol et
    const isParticipant =
      gameSession.creatorId.toString() === reporterId.toString() ||
      gameSession.acceptedPlayers?.some((p: any) => p.toString() === reporterId.toString());

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Bu oyuna katılmadınız. Sadece katıldığınız oyunlar için şikayet oluşturabilirsiniz.',
      });
    }

    // Şikayet edilen kullanıcı bu oyunda mı kontrol et
    const isReportedParticipant =
      gameSession.creatorId.toString() === reportedId.toString() ||
      gameSession.acceptedPlayers?.some((p: any) => p.toString() === reportedId.toString());

    if (!isReportedParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Şikayet ettiğiniz kullanıcı bu oyunda yer almıyor.',
      });
    }

    // Kendine şikayet edemez
    if (reporterId.toString() === reportedId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendinize şikayet edemezsiniz.',
      });
    }

    // Mesaj kontrolü
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Şikayet mesajı boş olamaz.',
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Şikayet mesajı en fazla 1000 karakter olabilir.',
      });
    }

    // Daha önce şikayet edilmiş mi kontrol et
    const existingComplaint = await Complaint.findOne({
      gameSessionId,
      reporterId,
      reportedId,
    });

    if (existingComplaint) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcıya zaten şikayet ettiniz.',
      });
    }

    // Şikayet oluştur
    const newComplaint = await Complaint.create({
      gameSessionId,
      reporterId,
      reportedId,
      message: message.trim(),
      status: 'pending',
    });

    console.log('[createComplaint] Şikayet oluşturuldu:', newComplaint._id);

    res.status(201).json({
      success: true,
      message: 'Şikayetiniz başarıyla gönderildi',
      data: newComplaint,
    });
  } catch (error: any) {
    console.error('[createComplaint] Hata:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcıya zaten şikayet ettiniz.',
      });
    }
    res.status(500).json({ success: false, message: 'Şikayet oluşturulurken bir hata oluştu' });
  }
};

/**
 * Kullanıcının şikayetlerini getir
 * GET /api/complaints/my
 */
export const getMyComplaints = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    console.log('[getMyComplaints] Kullanıcı şikayetleri getiriliyor:', userId);

    const complaints = await Complaint.find({ reporterId: userId })
      .populate('reportedId', 'firstName lastName profilePhoto')
      .populate('gameSessionId', 'title')
      .sort({ createdAt: -1 });

    const formattedComplaints = complaints.map((complaint: any) => ({
      id: complaint._id.toString(),
      reportedUser: {
        id: complaint.reportedId._id.toString(),
        firstName: complaint.reportedId.firstName,
        lastName: complaint.reportedId.lastName,
        profilePhoto: complaint.reportedId.profilePhoto,
      },
      game: {
        id: complaint.gameSessionId._id.toString(),
        title: complaint.gameSessionId.title,
      },
      message: complaint.message,
      status: complaint.status,
      createdAt: complaint.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedComplaints,
    });
  } catch (error: any) {
    console.error('[getMyComplaints] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Şikayetler getirilirken bir hata oluştu' });
  }
};
