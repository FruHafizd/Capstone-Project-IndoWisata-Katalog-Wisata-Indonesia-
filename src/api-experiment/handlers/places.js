class PlacesHandler {

constructor(service) {
    this._service = service;

    this.addPlaceHandler = this.addPlaceHandler.bind(this);
    this.getAllPlacesHandler = this.getAllPlacesHandler.bind(this);
    this.getOnePlaceHandler = this.getOnePlaceHandler.bind(this);
    this.updatePlaceHandler = this.updatePlaceHandler.bind(this);
    this.deletePlaceHandler = this.deletePlaceHandler.bind(this);
    this.searchWisata = this.searchWisata.bind(this);
    this.getTopWisata = this.getTopWisata.bind(this);
    this.getWisataByCategory = this.getWisataByCategory.bind(this);
}

async addPlaceHandler(request, h) {
    try {
      // Payload diharapkan memiliki: name, category (sebagai ID kategori), address, rating, location, imageUrl
      const placeId = await this._service.addPlace(request.payload);
      return h.response({
        status: 'success',
        data: { id: placeId },
      }).code(201);
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(400);
    }
}

async getAllPlacesHandler(request, h) {
    const places = await this._service.getAllPlaces();
    return h.response({
      status: 'success',
      message: 'Daftar tempat wisata berhasil diperoleh',
      data: { places },
    }).code(200);
}

async getOnePlaceHandler(request, h) {
    const { id } = request.params;
    const place = await this._service.getOnePlace(id);

    if (!place) {
      return h.response({
        status: 'fail',
        message: 'Tempat wisata tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Detail tempat wisata berhasil diperoleh',
      data: { place },
    }).code(200);
}

async updatePlaceHandler(request, h) {
    const { id } = request.params;
    const { name, category, address, rating, location, imageUrl } = request.payload;
    const updatedId = await this._service.updatePlace(id, {
      name,
      category,
      address,
      rating,
      location,
      imageUrl,
    });

    if (!updatedId) {
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui tempat wisata',
      }).code(400);
    }

    return h.response({
      status: 'success',
      message: 'Tempat wisata berhasil diperbarui',
      data: { placeId: updatedId },
    }).code(200);
}

async deletePlaceHandler(request, h) {
    const { id } = request.params;
    const deletedId = await this._service.deletePlace(id);

    if (!deletedId) {
      return h.response({
        status: 'fail',
        message: 'Tempat wisata tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Tempat wisata berhasil dihapus',
    }).code(200);
}

async searchWisata(request, h) {
  try {
    const { query } = request.query; // Mengambil parameter pencarian dari query string
    const results = await this._service.searchWisata(query);
    return h.response({
      status: 'success',
      message: 'Hasil pencarian tempat wisata',
      data: { places: results },
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: error.message,
    }).code(400);
  }
}

async getTopWisata(request, h) {
  try {
    const results = await this._service.getTopWisata();
    return h.response({
      status: 'success',
      message: 'Top 3 tempat wisata berdasarkan rating',
      data: { places: results },
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: error.message,
    }).code(400);
  }
}

async getWisataByCategory(request, h) {
  try {
    const { category } = request.params; // diharapkan kategori dikirim sebagai parameter URL
    const results = await this._service.getWisataByCategory(category);
    return h.response({
      status: 'success',
      message: `Tempat wisata dengan kategori ${category}`,
      data: { places: results },
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: error.message,
    }).code(400);
  }
}

}
module.exports = PlacesHandler;
