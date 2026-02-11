const { complaints } = require("../config/db");

exports.addComplaint = (req, res) => {
  const newComplaint = {
    id: complaints.length + 1,
    ...req.body,
    status: "Pending",
  };

  complaints.push(newComplaint);

  res.json({ message: "Complaint Added", data: newComplaint });
};

exports.getComplaints = (req, res) => {
  res.json(complaints);
};
