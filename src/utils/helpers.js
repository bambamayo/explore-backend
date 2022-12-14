exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getCloudinaryPublicUrl = (url, folder) => {
  const stringArr = url.split("/");

  const publicId = stringArr[stringArr.length - 1].split(".")[0];

  return `${
    process.env.NODE_ENV === "development"
      ? "explorer_images_dev"
      : "explorer_images"
  }/${folder}/${publicId}`;
};

exports.getPaginationParams = (params) => {
  const { page: requestedPage } = params;

  const limit = 20;
  const page = requestedPage * 1 || 1;
  const skip = (page - 1) * limit;

  return { limit, skip, page };
};
