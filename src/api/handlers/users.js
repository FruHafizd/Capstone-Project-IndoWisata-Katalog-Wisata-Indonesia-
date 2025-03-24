class UsersHandler {
    
constructor(service) {
      this._service = service;
  
      this.addUserHandler = this.addUserHandler.bind(this);
      this.getAllUsersHandler = this.getAllUsersHandler.bind(this);
      this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
      this.updateUserHandler = this.updateUserHandler.bind(this);
      this.deleteUserHandler = this.deleteUserHandler.bind(this);
}
  
async addUserHandler(request, h) {
      try {
        const { name, email, password, role } = request.payload;
        const userId = await this._service.addUser({ name, email, password, role });
        return h.response({
          status: 'success',
          data: { id: userId },
        }).code(201);
      } catch (error) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }
}
  
async getAllUsersHandler(request, h) {
      try {
        const users = await this._service.getAllUsers();
        return h.response({
          status: 'success',
          data: { users },
        }).code(200);
      } catch (error) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }
}
  
async getUserByIdHandler(request, h) {
      try {
        const { id } = request.params;
        const user = await this._service.getUserById(id);
        if (!user) {
          return h.response({
            status: 'fail',
            message: 'User tidak ditemukan',
          }).code(404);
        }
        return h.response({
          status: 'success',
          data: { user },
        }).code(200);
      } catch (error) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }
}
  
async updateUserHandler(request, h) {
      try {
        const { id } = request.params;
        const { name, email, password, role } = request.payload;
        const updatedId = await this._service.updateUser(id, { name, email, password, role });
        if (!updatedId) {
          return h.response({
            status: 'fail',
            message: 'Gagal memperbarui user',
          }).code(400);
        }
        return h.response({
          status: 'success',
          message: 'User berhasil diperbarui',
          data: { id: updatedId },
        }).code(200);
      } catch (error) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }
}
  
async deleteUserHandler(request, h) {
      try {
        const { id } = request.params;
        const deletedId = await this._service.deleteUser(id);
        if (!deletedId) {
          return h.response({
            status: 'fail',
            message: 'User tidak ditemukan',
          }).code(404);
        }
        return h.response({
          status: 'success',
          message: 'User berhasil dihapus',
        }).code(200);
      } catch (error) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }
    }
}
  
module.exports = UsersHandler;
  