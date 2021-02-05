const facilities = {
  data: [
    { name: "facility1" },
    { name: "facility2" },
    { name: "facility3" },
    { name: "facility4" },
  ],
};

exports.GetFacility = () => {
  const fnames = facilities.data.map((fname) => fname.name);
  // need to user axios get api to retrive facility names
  //   axios.get().then(response=>{console.log(response);}).catch(error=>{console.log(error);});
  return fnames;
};
