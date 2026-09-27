// Maps route names to URL paths so the web build gets real browser history:
// the address bar updates on navigation, and the browser back/forward
// buttons work like they would on any other website. Native ignores this
// unless a matching deep link comes in (no `prefixes` are registered here,
// so it's a no-op there — this is purely a web-routing fix).
const linking = {
  prefixes: [],
  config: {
    screens: {
      Welcome: '',
      Login: 'login',
      Signup: 'signup',
      ForgotPassword: 'forgot-password',
      ResetOtp: 'forgot-password/otp',
      ResetPasswordOtp: 'forgot-password/reset',
      // OTP sign-in is off for now — kept commented, not removed.
      // Otp: 'otp',
      PublicBookDetail: 'book/:code',
      PublicChapterReader: 'book/:code/chapter/:chapterNumber',

      // Authenticated app shell (MainStack): the 3-tab app (Home / Leaderboard
      // / Aarambh+) plus Textbooks/Tests/More/Profile/Admin, each pushed on
      // top of it rather than being a tab — see MainStack.js.
      Tabs: {
        screens: {
          Home: 'home',
          Leaderboard: 'leaderboard',
          AarambhPlus: 'aarambh-plus',
        },
      },
      TextbooksTab: {
        screens: {
          TextbookList: 'textbooks',
          TextbookDetail: 'textbooks/:code',
          Chapter: 'textbooks/:code/:chapterNumber',
        },
      },
      TestsTab: {
        screens: {
          TestList: 'tests',
          MixQuizSetup: 'tests/mix-quiz',
          TestAttempt: 'tests/attempt',
          TestResult: 'tests/result',
          MyAttempts: 'tests/my-attempts',
        },
      },
      MoreTab: {
        screens: {
          MoreHub: 'more',
          Bookmarks: 'more/bookmarks',
          MentorList: 'more/mentors',
          MentorSlots: 'more/mentors/:mentorId',
          BookingConfirmation: 'more/mentors/booked',
          MyDoubts: 'more/doubts',
          AskDoubt: 'more/doubts/ask',
          DoubtDetail: 'more/doubts/:doubtId',
          BatchList: 'more/batches',
          BatchDetail: 'more/batches/:batchId',
          Pulse: 'more/pulse',
          Predictor: 'more/predictor',
        },
      },
      Profile: 'profile',
      ResetPassword: 'profile/reset-password',
      Admin: {
        screens: {
          AdminHub: 'admin',
          AdminTextbookList: 'admin/textbooks',
          AdminTextbookForm: 'admin/textbooks/new',
          AdminTextbookDetail: 'admin/textbooks/:code',
          AdminChapterForm: 'admin/chapters/form',
          AdminChapterPages: 'admin/chapters/:chapterId/pages',
          AdminPageForm: 'admin/pages/form',
          AdminQuestionList: 'admin/questions',
          AdminQuestionForm: 'admin/questions/form',
          AdminBulkQuestionUpload: 'admin/questions/bulk',
          AdminMentorForm: 'admin/mentors',
          AdminBatchList: 'admin/batches',
          AdminBatchForm: 'admin/batches/form',
          AdminPulseForm: 'admin/pulse',
          AdminDoubts: 'admin/doubts',
        },
      },
    },
  },
};

export default linking;
