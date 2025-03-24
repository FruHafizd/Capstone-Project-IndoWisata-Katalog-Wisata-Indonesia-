class CategoriesHandler {

constructor(service) {
      this._service = service;
  
      this.addCategoryHandler = this.addCategoryHandler.bind(this);
      this.getAllCategoriesHandler = this.getAllCategoriesHandler.bind(this);
      this.getOneCategoryHandler = this.getOneCategoryHandler.bind(this);
      this.updateCategoryHandler = this.updateCategoryHandler.bind(this);
      this.deleteCategoryHandler = this.deleteCategoryHandler.bind(this);
}
  
async addCategoryHandler(request, h) {
      try {
        const { name } = request.payload;
        const categoryId = await this._service.addCategory({ name });
        return h.response({
          status: 'success',
          data: { id: categoryId },
        }).code(201);
      } catch (error) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }
}
  
async getAllCategoriesHandler(request, h) {
      const categories = await this._service.getAllCategories();
      return h.response({
        status: 'success',
        message: 'Daftar kategori berhasil diperoleh',
        data: { categories },
      }).code(200);
}
  
async getOneCategoryHandler(request, h) {
      const { id } = request.params;
      const category = await this._service.getOneCategory(id);
  
      if (!category) {
        return h.response({
          status: 'fail',
          message: 'Kategori tidak ditemukan',
        }).code(404);
      }
  
      return h.response({
        status: 'success',
        message: 'Detail kategori berhasil diperoleh',
        data: { category },
      }).code(200);
}
  
async updateCategoryHandler(request, h) {
      const { id } = request.params;
      const { name } = request.payload;
      const updatedId = await this._service.updateCategory(id, { name });
  
      if (!updatedId) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui kategori',
        }).code(400);
      }
  
      return h.response({
        status: 'success',
        message: 'Kategori berhasil diperbarui',
        data: { id: updatedId },
      }).code(200);
}
  
async deleteCategoryHandler(request, h) {
      const { id } = request.params;
      const deletedId = await this._service.deleteCategory(id);
  
      if (!deletedId) {
        return h.response({
          status: 'fail',
          message: 'Kategori tidak ditemukan',
        }).code(404);
      }
  
      return h.response({
        status: 'success',
        message: 'Kategori berhasil dihapus',
      }).code(200);
}

}
  
module.exports = CategoriesHandler;
  