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
