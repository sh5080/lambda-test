// deadline 기간 내 수락
export const getAccessDataQuery = () => {
  return `
      SELECT mp.female_id, mp.male_id, 
      male.mobile_number AS male_number, female.mobile_number AS female_number
      FROM matching_public mp
      JOIN global_status gs ON mp.phase = gs.phase
      LEFT JOIN users female ON mp.female_id = female.id
      LEFT JOIN users male ON mp.male_id = male.id
      WHERE gs.id = (SELECT MAX(id) FROM global_status)
        AND mp.deadline > NOW()
        AND mp.f_choice = 1
        AND mp.m_choice = 1;
    `;
};
// deadline 기간 내 거절
export const getRejectDataQuery = () => {
  return `
        SELECT mp.female_id, mp.male_id, 
        male.mobile_number AS male_number, female.mobile_number AS female_number
        FROM matching_public mp
        JOIN global_status gs ON mp.phase = gs.phase
        LEFT JOIN users female ON mp.female_id = female.id
        LEFT JOIN users male ON mp.male_id = male.id
        WHERE gs.id = (SELECT MAX(id) FROM global_status)
          AND mp.deadline > NOW()
          AND mp.f_choice = -1
          AND mp.m_choice = -1;
      `;
};
// deadline 기간 내 미선택
export const getNonSelectDataQuery = () => {
  return `
        SELECT mp.female_id, mp.male_id, 
        male.mobile_number AS male_number, female.mobile_number AS female_number
        FROM matching_public mp
        JOIN global_status gs ON mp.phase = gs.phase
        LEFT JOIN users female ON mp.female_id = female.id
        LEFT JOIN users male ON mp.male_id = male.id
        WHERE gs.id = (SELECT MAX(id) FROM global_status)
          AND mp.deadline > NOW()
          AND mp.f_choice = 0
          AND mp.m_choice = 0;
      `;
};

// deadline 기간 지나고 권유 문자 받고도 아직도 choice = 0
export const getDormantDataQuery = () => {
  return `
        SELECT mp.female_id, mp.male_id, 
        male.mobile_number AS male_number, female.mobile_number AS female_number
        FROM matching_public mp
        JOIN global_status gs ON mp.phase = gs.phase
        LEFT JOIN users female ON mp.female_id = female.id
        LEFT JOIN users male ON mp.male_id = male.id
        WHERE gs.id = (SELECT MAX(id) FROM global_status)
          AND mp.deadline < NOW()
          AND mp.f_choice = 0
          AND mp.m_choice = 0;
      `;
};
