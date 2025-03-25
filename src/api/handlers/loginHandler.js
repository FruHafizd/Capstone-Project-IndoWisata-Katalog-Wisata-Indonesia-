const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ClientError = require('../../errors/client-error');

class LoginHandler {
  constructor(service) {
    this._service = service;
    this.loginHandler = this.loginHandler.bind(this);
  }

  async loginHandler(request, h) {
    try {
      const { email, password } = request.payload;
      const user = await this._service.getUserByEmail(email);

      if (!user) {
        throw new ClientError('Email atau password salah', 401);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new ClientError('Email atau password salah', 401);
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return h.response({
        status: 'success',
        message: 'Login berhasil',
        data: { token },
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }
      console.error(error);
      return h.response({
        status: 'error',
        message: 'Gagal melakukan login, silakan coba lagi',
      }).code(500);
    }
  }
}

module.exports = LoginHandler;
