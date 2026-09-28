import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Textbook } from '../models/textbook.model.js';
import { Chapter } from '../models/chapter.model.js';
import { Page } from '../models/page.model.js';
import { Section } from '../models/section.model.js';
import { Question } from '../models/question.model.js';
import { MockTest } from '../models/mockTest.model.js';
import { Mentor } from '../models/mentor.model.js';
import { AarambhPulse } from '../models/aarambhPulse.model.js';
import { CollegeCutoff } from '../models/collegeCutoff.model.js';
import { Batch } from '../models/batch.model.js';

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aarambh_db');
    }

    console.log('[Seeder] Cleaning existing database collections...');
    await User.deleteMany({});
    await Textbook.deleteMany({});
    await Chapter.deleteMany({});
    await Page.deleteMany({});
    await Section.deleteMany({});
    await Question.deleteMany({});
    await MockTest.deleteMany({});
    await Mentor.deleteMany({});
    await AarambhPulse.deleteMany({});
    await CollegeCutoff.deleteMany({});
    await Batch.deleteMany({});

    console.log('[Seeder] Seeding Users (Admin & Student)...');
    await User.create({
      name: 'Aarambh Admin',
      email: 'admin@aarambh.in',
      password: 'admin123Password!',
      role: 'admin',
      isEmailVerified: true,
    });

    await User.create({
      name: 'Aarambh Student',
      email: 'student@aarambh.in',
      password: 'student123Password!',
      role: 'student',
      isEmailVerified: true,
    });

    console.log('[Seeder] Seeding Textbooks...');
    const bio11 = await Textbook.create({
      title: 'Biology 11th',
      code: 'biology-11',
      subject: 'Biology',
      classLevel: 'XI',
      icon: '🧬',
      color: '#3dd68c',
      examTags: ['NEET'],
      pdfUrl: 'https://aarambh-media-assets.s3.ap-south-1.amazonaws.com/pdfs/ncert-bio-11.pdf',
    });

    const chem11 = await Textbook.create({
      title: 'Chemistry 11th Part 1',
      code: 'chemistry-11-part-1',
      subject: 'Chemistry',
      classLevel: 'XI',
      icon: '⚗️',
      color: '#f0a500',
      examTags: ['NEET', 'JEE'],
      pdfUrl: 'https://aarambh-media-assets.s3.ap-south-1.amazonaws.com/pdfs/ncert-chem-11.pdf',
    });

    const phy11 = await Textbook.create({
      title: 'Physics 11th Part 1',
      code: 'physics-11-part-1',
      subject: 'Physics',
      classLevel: 'XI',
      icon: '⚡',
      color: '#4aa3ff',
      examTags: ['NEET', 'JEE'],
      pdfUrl: 'https://aarambh-media-assets.s3.ap-south-1.amazonaws.com/pdfs/ncert-phy-11.pdf',
    });

    console.log('[Seeder] Seeding Chapters...');
    const ch1 = await Chapter.create({
      textbookId: bio11._id,
      chapterNumber: 1,
      title: 'The Living World',
      description: 'Diversity in living organisms, taxonomic categories and aids.',
      totalPages: 14,
      startPage: 1,
      endPage: 14,
      examTags: ['NEET'],
      pdfUrl: 'https://aarambh-media-assets.s3.ap-south-1.amazonaws.com/pdfs/ncert-bio-11-ch1.pdf',
    });

    const ch2 = await Chapter.create({
      textbookId: bio11._id,
      chapterNumber: 2,
      title: 'Biological Classification',
      description: 'Kingdom Monera, Protista, Fungi, Plantae and Animalia overview.',
      totalPages: 18,
      startPage: 15,
      endPage: 32,
      examTags: ['NEET'],
      pdfUrl: 'https://aarambh-media-assets.s3.ap-south-1.amazonaws.com/pdfs/ncert-bio-11-ch2.pdf',
    });

    const chemCh1 = await Chapter.create({
      textbookId: chem11._id,
      chapterNumber: 1,
      title: 'Some Basic Concepts of Chemistry',
      description: 'Mole concept, stoichiometry, and concentration terms.',
      totalPages: 24,
      startPage: 1,
      endPage: 24,
      examTags: ['NEET', 'JEE'],
    });

    console.log('[Seeder] Seeding Pages...');
    // Pages belong to the book. Their pageNumber decides which chapter-range
    // they fall in (bio pages 3 & 7 -> chapter 1 [1..14]; chem page 12 -> chem ch1).
    const bioPage3 = await Page.create({ textbookId: bio11._id, pageNumber: 3, order: 3 });
    const bioPage7 = await Page.create({ textbookId: bio11._id, pageNumber: 7, order: 7 });
    const chemPage12 = await Page.create({ textbookId: chem11._id, pageNumber: 12, order: 12 });

    console.log('[Seeder] Seeding Questions...');
    const q1 = await Question.create({
      textbookId: bio11._id,
      pageId: bioPage3._id,
      pageNumber: 3,
      questionText: 'Which of the following is considered a defining property of living organisms?',
      options: [
        { text: 'Growth' },
        { text: 'Reproduction' },
        { text: 'Metabolism' },
        { text: 'Self-increase in mass' },
      ],
      correctOptionIndex: 2,
      explanation: 'Metabolism is a defining feature of all living organisms without exception.',
      ncertRefPage: 'NCERT XI Biology - Page 3',
      difficulty: 'easy',
      examTags: ['NEET'],
      isHighProbability: true,
    });

    const q2 = await Question.create({
      textbookId: bio11._id,
      pageId: bioPage7._id,
      pageNumber: 7,
      questionText: 'The correct sequence of taxonomic categories in ascending order is:',
      options: [
        { text: 'Species -> Genus -> Family -> Order -> Class -> Phylum -> Kingdom' },
        { text: 'Kingdom -> Phylum -> Class -> Order -> Family -> Genus -> Species' },
        { text: 'Species -> Family -> Genus -> Order -> Class -> Phylum -> Kingdom' },
        { text: 'Species -> Genus -> Order -> Family -> Class -> Phylum -> Kingdom' },
      ],
      correctOptionIndex: 0,
      explanation: 'Hierarchy: Species -> Genus -> Family -> Order -> Class -> Phylum -> Kingdom.',
      ncertRefPage: 'NCERT XI Biology - Page 7',
      difficulty: 'medium',
      examTags: ['NEET'],
      pyqYear: 2024,
      isHighProbability: true,
    });

    const q3 = await Question.create({
      textbookId: chem11._id,
      pageId: chemPage12._id,
      pageNumber: 12,
      questionText: 'What is the molar mass of water (H2O)?',
      options: [
        { text: '16 g/mol' },
        { text: '18 g/mol' },
        { text: '20 g/mol' },
        { text: '32 g/mol' },
      ],
      correctOptionIndex: 1,
      explanation: 'H (1*2) + O (16) = 18 g/mol.',
      ncertRefPage: 'NCERT XI Chemistry - Page 12',
      difficulty: 'easy',
      examTags: ['NEET', 'JEE'],
      isHighProbability: true,
    });

    console.log('[Seeder] Seeding Mock Tests...');
    await MockTest.create({
      title: 'Aarambh Full Course CBT Mock Test 1 (NEET 2027/2028)',
      type: 'full_length',
      exam: 'NEET',
      durationMinutes: 180,
      totalMarks: 720,
      questions: [q1._id, q2._id, q3._id],
    });

    console.log('[Seeder] Seeding Mentors...');
    await Mentor.create({
      name: 'Dr. Aarav Sharma',
      rankInfo: 'NEET AIR 114 (AIIMS Delhi)',
      college: 'AIIMS New Delhi',
      bio: 'Cracked NEET with 710/720. Specializing in Biology NCERT line-by-line decoding and test attempt strategy.',
      rating: 4.9,
      hourlyRate: 499,
      subjects: ['NEET Biology', 'Strategy', 'Time Management'],
      slots: [
        {
          startTime: new Date(Date.now() + 86400000), // Tomorrow
          endTime: new Date(Date.now() + 86400000 + 1800000),
          isBooked: false,
        },
        {
          startTime: new Date(Date.now() + 172800000), // Day after tomorrow
          endTime: new Date(Date.now() + 172800000 + 1800000),
          isBooked: false,
        },
      ],
    });

    console.log('[Seeder] Seeding Aarambh Pulse Daily Workout...');
    const today = new Date().toISOString().split('T')[0];
    await AarambhPulse.create({
      date: today,
      title: 'Aarambh Daily 5-Minute Memory Workout',
      puzzles: [
        {
          term: 'Binomial Nomenclature',
          definition: 'System of naming organisms with genus and species by Carl Linnaeus.',
          category: 'Concept',
        },
        {
          term: 'Avogadro Number',
          definition: '6.022 x 10^23 particles per mole.',
          category: 'Formula',
        },
      ],
    });

    console.log('[Seeder] Seeding College Cutoff Predictor Dataset...');
    await CollegeCutoff.insertMany([
      {
        collegeName: 'AIIMS New Delhi',
        state: 'Delhi',
        category: 'GEN',
        quota: 'AIQ',
        closingRank: 55,
        closingMarks: 715,
      },
      {
        collegeName: 'Maulana Azad Medical College (MAMC), New Delhi',
        state: 'Delhi',
        category: 'GEN',
        quota: 'AIQ',
        closingRank: 95,
        closingMarks: 710,
      },
      {
        collegeName: 'VMMCI & Safdarjung Hospital, New Delhi',
        state: 'Delhi',
        category: 'GEN',
        quota: 'AIQ',
        closingRank: 140,
        closingMarks: 705,
      },
      {
        collegeName: 'King George’s Medical University (KGMU), Lucknow',
        state: 'Uttar Pradesh',
        category: 'GEN',
        quota: 'AIQ',
        closingRank: 1200,
        closingMarks: 675,
      },
      {
        collegeName: 'Grant Medical College, Mumbai',
        state: 'Maharashtra',
        category: 'GEN',
        quota: 'AIQ',
        closingRank: 2800,
        closingMarks: 655,
      },
    ]);

    console.log('[Seeder] Seeding Live Target Batches...');
    await Batch.create({
      title: 'Aarambh NEET 2026 Ultimate Ranker Batch',
      targetExam: 'NEET',
      targetYear: 2026,
      description: 'Complete NCERT line-by-line coverage for Biology, Chemistry, and Physics with 10,000+ PYQs and Weekly CBT Mock Tests.',
      bannerImageUrl: 'https://aarambh-media-assets.s3.ap-south-1.amazonaws.com/banners/neet-2026-batch.jpg',
      price: 0, // FREE Batch
      features: [
        'Complete NCERT 11th & 12th Coverage',
        'Daily Practice Papers (DPPs) with video solutions',
        'Unlimited CBT Mock Test Series',
        '1:1 Mentor Doubt Resolution',
      ],
      teachers: [
        { name: 'Dr. Aarav Sharma', subject: 'Biology', experience: '8 Years', avatarUrl: '' },
        { name: 'Prof. Ramesh Gupta', subject: 'Chemistry', experience: '12 Years', avatarUrl: '' },
      ],
      schedule: [
        { day: 'Monday', subject: 'Biology', topic: 'The Living World', time: '10:00 AM' },
        { day: 'Tuesday', subject: 'Chemistry', topic: 'Mole Concept', time: '11:30 AM' },
      ],
    });

    console.log('✅ [Seeder] Database successfully seeded for Aarambh!');
  } catch (error) {
    console.error('❌ [Seeder Error]:', error);
  } finally {
    if (process.argv[1] && process.argv[1].endsWith('aarambh.seeder.js')) {
      await mongoose.disconnect();
      process.exit(0);
    }
  }
};

if (process.argv[1] && process.argv[1].endsWith('aarambh.seeder.js')) {
  seedDatabase();
}
