const {
  UserPayloadSchema,
  UserUpdateSchema,
} = require("../../utils/validators/users");
const ClientError = require("../../errors/client-error");

class UsersHandler {
  constructor(service) {
    this._service = service;

    // Auto-bind methods
    const methods = [
      "addUserHandler",
      "getAllUsersHandler",
      "getUserByIdHandler",
      "updateUserHandler",
      "deleteUserHandler",
    ];
    methods.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  async addUserHandler(request, h) {
    try {
      const { error, value } = UserPayloadSchema.validate(request.payload);
      if (error) {
        throw new ClientError(error.message, 400);
      }

      const {
        name,
        email,
        password,
        role = "user",
        age,
        occupation,
        marital_status,
        hobby,
      } = value;

      const userId = await this._service.addUser({
        name,
        email,
        password,
        role,
        age: age || null,
        occupation: occupation || null,
        marital_status: marital_status || null,
        hobby: hobby || null,
      });

      return h
        .response({
          status: "success",
          data: { id: userId },
        })
        .code(201);
    } catch (error) {
      if (error.message.includes("Email sudah terdaftar")) {
        return h
          .response({
            status: "fail",
            message: "Email sudah terdaftar",
          })
          .code(409);
      }

      if (error instanceof ClientError) {
        return h
          .response({
            status: "fail",
            message: error.message,
          })
          .code(error.statusCode);
      }

      console.error(error);
      return h
        .response({
          status: "error",
          message: "Maaf, terjadi kesalahan pada server",
        })
        .code(500);
    }
  }

  async getAllUsersHandler(request, h) {
    try {
      const users = await this._service.getAllUsers();
      return h
        .response({
          status: "success",
          data: { users },
        })
        .code(200);
    } catch (error) {
      console.error(error);
      return h
        .response({
          status: "error",
          message: "Gagal mengambil data pengguna",
        })
        .code(500);
    }
  }

  async getUserByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const user = await this._service.getUserById(id);

      if (!user) {
        throw new ClientError("User tidak ditemukan", 404);
      }

      return h
        .response({
          status: "success",
          data: { user },
        })
        .code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: "fail",
            message: error.message,
          })
          .code(error.statusCode);
      }

      console.error(error);
      return h
        .response({
          status: "error",
          message: "Gagal mengambil data pengguna",
        })
        .code(500);
    }
  }

  async updateUserHandler(request, h) {
    try {
      const { error, value } = UserUpdateSchema.validate(request.payload);
      if (error) {
        throw new ClientError(error.message, 400);
      }

      const { id } = request.params;
      const updatedFields = {
        ...value,
        age: value.age || null,
        occupation: value.occupation || null,
        marital_status: value.marital_status || null,
        hobby: value.hobby || null,
      };

      const updatedId = await this._service.updateUser(id, updatedFields);

      if (!updatedId) {
        throw new ClientError("Gagal memperbarui user", 400);
      }

      return h
        .response({
          status: "success",
          message: "User berhasil diperbarui",
          data: { id: updatedId },
        })
        .code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: "fail",
            message: error.message,
          })
          .code(error.statusCode);
      }

      console.error(error);
      return h
        .response({
          status: "error",
          message: "Gagal memperbarui pengguna",
        })
        .code(500);
    }
  }

  async deleteUserHandler(request, h) {
    try {
      const { id } = request.params;
      const deletedId = await this._service.deleteUser(id);

      if (!deletedId) {
        throw new ClientError("User tidak ditemukan", 404);
      }

      return h
        .response({
          status: "success",
          message: "User berhasil dihapus",
        })
        .code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: "fail",
            message: error.message,
          })
          .code(error.statusCode);
      }

      console.error(error);
      return h
        .response({
          status: "error",
          message: "Gagal menghapus pengguna",
        })
        .code(500);
    }
  }
}

module.exports = UsersHandler;
