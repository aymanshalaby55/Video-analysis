/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prettier/prettier */
class APIFeatures {
  constructor(query, querystring) {
    this.query = query; //  Mongoose query with no parameters at this point.
    this.querystring = querystring; // The queryString,  is the actual request sent from the clien
  }

  filter() {
    // 1) filter
    const queryobj = { ...this.querystring };
    const ExcludedFileds = ["sort", "limit", "page", "fileds"];

    // delete execluded operations other operations
    ExcludedFileds.forEach((el) => delete queryobj[el]);
    let querystr = JSON.stringify(queryobj);

    // advance filtering
    querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(querystr));
    return this;
  }

  sort() {
    if (this.querystring.sort) {
      // GET ALL FILEDS
      const SortBy = this.querystring.sort.split(",").join(" ");
      this.query = this.query.sort(SortBy);
    } else {
      this.query = this.query.sort("-id");
    }
    return this;
  }

  search() {
    if (this.querystring.username) {
      this.query = this.query.find({
        username: { $regex: this.querystring.username, $options: "i" },
      });
    }
    return this;
  }

  limit() {
    if (this.querystring.fileds) {
      const fileds = this.querystring.fileds.split(",").join(" ");
      this.query = this.query.select(fileds);
    } else {
      this.query = this.query.select(""); // exclude _v filed
    }
    return this;
  }

  paginate() {
    // 4) Pageination
    const page = this.querystring.page * 1 || 1;
    const limit = this.querystring.limit * 1 || 5;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
