import TestUser from "../models/TestMatching.js"; // 테스트용 모델을 임포트
import { findBestMatch } from "../services/matchingService.js";

const getUserMatch = async (req, res) => {
  const userId = req.params.userId;
  const user = await TestUser.findOne({ id: userId });

  //   console.log(user);

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  const bestMatch = await findBestMatch(user);

  if (!bestMatch.length) {
    return res.status(404).json({ msg: "No suitable match found" });
  }

  res.json({ bestMatch });
};

export { getUserMatch };
