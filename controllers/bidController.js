const Bid = require("../models/Bid");
const BidItem = require("../models/BidItem");
const Bidder = require("../models/Bidder");
const BidEntry = require("../models/BidEntry");

// Create a new bid
const createBid = async (req, res) => {
  const { title, bidItems } = req.body;

  try {
    const newBid = new Bid({
      title,
      createdBy: req.user._id,
      bidItems: [],
    });

    // Create bid items and add to the bid
    for (let item of bidItems) {
      const bidItem = new BidItem({
        description: item.description,
        baseAmount: item.baseAmount,
        bid: newBid._id,
      });
      await bidItem.save();
      newBid.bidItems.push(bidItem._id);
    }

    await newBid.save();
    res.status(201).json(newBid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Invite bidders to participate in the bid
const inviteBidders = async (req, res) => {
  const { bidderIds } = req.body;

  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    for (let id of bidderIds) {
      const bidder = await Bidder.findById(id);
      if (bidder) {
        bidder.invitedBids.push(bid._id);
        await bidder.save();
      }
    }

    res.status(200).json({ message: "Bidders invited successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Set the start and end times for the bid
const setBidTimes = async (req, res) => {
  const { startTime, endTime } = req.body;

  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    bid.startTime = startTime;
    bid.endTime = endTime;
    await bid.save();

    res.status(200).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Publish the bid
const publishBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    bid.status = "active";
    await bid.save();

    res.status(200).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Monitor bids in real-time
const monitorBids = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("bidItems");
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    // Here, you would implement real-time updates using WebSockets

    res.status(200).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// View bid summary after bidding ends
const viewBidSummary = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate({
      path: "bidItems",
      populate: {
        path: "bids", // Ensure this path is correct
        model: "BidEntry",
      },
    });

    if (!bid) return res.status(404).json({ message: "Bid not found" });

    res.status(200).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBid,
  inviteBidders,
  setBidTimes,
  publishBid,
  monitorBids,
  viewBidSummary,
};
