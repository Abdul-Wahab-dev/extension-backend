class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.totalDocs = 0;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    const excludeEmptyField = Object.keys(queryObj);
    excludeEmptyField.forEach((el) => {
      // if (!queryObj[el] || queryObj[el].length === 0 || queryObj[el] == 0) {
      if (
        !queryObj[el] ||
        queryObj[el] == undefined ||
        queryObj[el].length === 0 ||
        queryObj[el] == 0
      ) {
        delete queryObj[el];
      }
    });

    // 2B) Advance filtering
    queryObj.deleted = false;
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    if (Object.keys(JSON.parse(queryStr)).includes("title")) {
      const obj = { ...JSON.parse(queryStr) };
      const title = obj.title;
      delete obj["title"];

      this.query.find({ title: new RegExp(title, "i"), ...obj });
      return this;
    } else {
      this.query.find(JSON.parse(queryStr));
      return this;
    }
    // return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitField() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  totalFilterDocs() {
    const totalDocs = this.query.countDocuments();
    return totalDocs;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeature;
