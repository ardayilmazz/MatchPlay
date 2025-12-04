import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MatchPlay API',
    version: '1.0.0',
    description: 'MatchPlay Backend API Dokümantasyonu',
    contact: {
      name: 'MatchPlay Support',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3001}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Kullanıcı ID',
          },
          firstName: {
            type: 'string',
            description: 'Ad',
          },
          lastName: {
            type: 'string',
            description: 'Soyad',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'E-posta adresi',
          },
          university: {
            type: 'string',
            description: 'Üniversite',
          },
          department: {
            type: 'string',
            description: 'Bölüm',
          },
          birthDate: {
            type: 'string',
            format: 'date',
            description: 'Doğum tarihi',
          },
          profilePhoto: {
            type: 'string',
            description: 'Profil fotoğrafı URL',
          },
          bio: {
            type: 'string',
            description: 'Biyografi',
          },
          sports: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'İlgilenilen sporlar',
          },
          skillLevel: {
            type: 'string',
            description: 'Beceri seviyesi',
          },
          isProfileCompleted: {
            type: 'boolean',
            description: 'Profil tamamlandı mı?',
          },
        },
      },
      SendVerificationCodeRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'E-posta adresi',
            example: 'user@example.com',
          },
        },
      },
      SendVerificationCodeResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Doğrulama kodu e-posta adresinize gönderildi.',
          },
        },
      },
      VerifyCodeRequest: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'E-posta adresi',
            example: 'user@example.com',
          },
          code: {
            type: 'string',
            description: '6 haneli doğrulama kodu',
            example: '123456',
          },
        },
      },
      VerifyCodeResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'E-posta başarıyla doğrulandı.',
          },
        },
      },
      RegisterUserRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password', 'birthDate'],
        properties: {
          firstName: {
            type: 'string',
            description: 'Ad',
            example: 'Ahmet',
          },
          lastName: {
            type: 'string',
            description: 'Soyad',
            example: 'Yılmaz',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'E-posta adresi',
            example: 'ahmet@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'Şifre',
            example: 'SecurePassword123!',
          },
          birthDate: {
            type: 'string',
            format: 'date',
            description: 'Doğum tarihi (YYYY-MM-DD)',
            example: '1995-05-15',
          },
          university: {
            type: 'string',
            description: 'Üniversite',
            example: 'İstanbul Üniversitesi',
          },
          department: {
            type: 'string',
            description: 'Bölüm',
            example: 'Bilgisayar Mühendisliği',
          },
          profilePhoto: {
            type: 'string',
            description: 'Profil fotoğrafı (base64 veya URL)',
            example: '',
          },
          bio: {
            type: 'string',
            description: 'Biyografi / Hakkımda',
            example: 'Spor tutkunuyum, özellikle futbol oynamayı seviyorum.',
          },
        },
      },
      RegisterUserResponse: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Kullanıcı ID',
          },
          firstName: {
            type: 'string',
            description: 'Ad',
          },
          lastName: {
            type: 'string',
            description: 'Soyad',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'E-posta adresi',
          },
          university: {
            type: 'string',
            description: 'Üniversite',
          },
          department: {
            type: 'string',
            description: 'Bölüm',
          },
          profilePhoto: {
            type: 'string',
            description: 'Profil fotoğrafı',
          },
          bio: {
            type: 'string',
            description: 'Biyografi / Hakkımda',
          },
          sports: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Spor ilgi alanları',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Oluşturulma tarihi',
          },
          token: {
            type: 'string',
            description: 'JWT token',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Hata mesajı',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

