// deadline 기간 내 미선택 / 수락 요청 메세지
export const getNonSelectQuery = () => {
  return `
        SELECT mp.female_id, mp.male_id, 
        male.mobile_number AS male_number, female.mobile_number AS female_number
        FROM matching_public mp
        JOIN global_status gs ON mp.phase = gs.phase
        LEFT JOIN users female ON mp.female_id = female.id
        LEFT JOIN users male ON mp.male_id = male.id
        WHERE gs.id = (SELECT MAX(id) FROM global_status)
        AND gs.status = 1  
        AND mp.deadline > NOW()
        AND (mp.f_choice = 0 OR mp.m_choice = 0);
      `;
};

// ****** 기간 내 남성 미선택 / 여성 수락 메세지 ******
export const getMaleAcceptenceQuery = () => {
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
          AND mp.m_choice = 0;
      `;
};

// ****** 기간 내 여성 미선택 / 남성 수락 메세지 ******
export const getFemaleAcceptenceQuery = () => {
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
          AND mp.m_choice = 1;
      `;
};

// deadline 기간 내 미선택 / 권유 문자 받고도 아직도 choice = 0
export const getDormantQuery = () => {
  return `
        SELECT mp.female_id, mp.male_id, 
        male.mobile_number AS male_number, female.mobile_number AS female_number
        FROM matching_public mp
        JOIN global_status gs ON mp.phase = gs.phase
        LEFT JOIN users female ON mp.female_id = female.id
        LEFT JOIN users male ON mp.male_id = male.id
        WHERE gs.id = (SELECT MAX(id) FROM global_status)
        AND gs.status = 1  
        AND mp.deadline < NOW()
        AND (mp.f_choice = 0 OR mp.m_choice = 0);
      `;
};
