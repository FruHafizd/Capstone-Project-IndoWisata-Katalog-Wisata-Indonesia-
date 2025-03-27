const ClientError = require("../../errors/client-error");

class UserVisitsHandler {
  constructor(service) {
    this._service = service;
    // Bind semua method yang akan digunakan
    this.updateUserVisitHandler = this.updateUserVisitHandler.bind(this);
    this.getAggregatedUserVisitsHandler = this.getAggregatedUserVisitsHandler.bind(this);
  }

  async updateUserVisitHandler(request, h) {
    try {
      const { userId, placeId } = request.payload;
      if (!userId || !placeId) {
        throw new ClientError("userId dan placeId harus disediakan", 400);
      }

      const result = await this._service.updateUserVisit({ userId, placeId });

      return h
        .response({
          status: "success",
          message: "Data user visit berhasil diperbarui",
          data: result,
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
          message: "Gagal memperbarui data user visit",
        })
        .code(500);
    }
  }

  async getAggregatedUserVisitsHandler(request, h) {
    try {
      const aggregatedData = await this._service.getAggregatedUserVisits();
      // Ubah format data menjadi objek dengan key user id, jika diinginkan
      const result = aggregatedData.reduce((acc, curr) => {
        acc[curr.id] = {
          name: curr.name,
          visits: curr.visits,
        };
        return acc;
      }, {});

      return h
        .response({
          status: "success",
          data: result,
        })
        .code(200);
    } catch (error) {
      console.error(error);
      return h
        .response({
          status: "error",
          message: "Gagal mengambil data user visits",
        })
        .code(500);
    }
  }
}

module.exports = UserVisitsHandler;
