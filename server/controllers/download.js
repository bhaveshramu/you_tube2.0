import download from "../Modals/download.js";
import users from "../Modals/Auth.js";

export const downloadVideo = async (req, res) => {
  const { userid, videoid, videotitle, filepath } = req.body;

  try {
    // Find user
    const user = await users.findById(userid);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const plan = user.plan || "Free";

    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count today's downloads
    const todayDownloads = await download.countDocuments({
      userid,
      downloadDate: { $gte: today },
    });

    // Download limits based on subscription plan
const planLimits = {
  Free: 1,
  Bronze: 5,
  Silver: 15,
  Gold: Infinity,
};

const limit = planLimits[plan] ?? 1;

if (todayDownloads >= limit) {
  return res.status(400).json({
    message:
      plan === "Gold"
        ? "Unlimited downloads available."
        : `Your ${plan} plan allows only ${limit} downloads per day.`,
  });
}

    // Save download
    const newDownload = new download({
      userid,
      videoid,
      videotitle,
      filepath,
      userPlan: plan,
      downloadCount: todayDownloads + 1,
    });

    await newDownload.save();

    return res.status(200).json({
      success: true,
      message: "Download successful.",
      download: newDownload,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};
export const getDownloads = async (req, res) => {
  const { userid } = req.params;

  try {
    const downloads = await download.find({ userid });

    return res.status(200).json(downloads);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};