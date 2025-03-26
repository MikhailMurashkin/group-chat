const API_URL = 'http://localhost:3000';

export const createGroup = async (groupName, groupDescription) => {
  const response = await fetch(`${API_URL}/groups/createGroup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ 
      groupName, groupDescription
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось создать группу');
  }

  window.location = `group/${data.groupId}`

  return data;
};

export const getGroupsByUserId = async () => {
  const response = await fetch(`${API_URL}/groups/getGroupsByUserId`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  console.log(data.groups)

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось получить список групп');
  }

  return data.groups;
};

export const getGroupInfoById = async (groupId) => {
  const response = await fetch(`${API_URL}/groups/getGroupInfoById`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ 
      groupId
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось получить список групп');
  }

  return data;
};

export const joinGroupByCode = async (inviteCode) => {
  const response = await fetch(`${API_URL}/groups/joinGroupByCode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ 
      inviteCode
    }),
  });

  const data = await response.json();

  console.log(data)

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось получить список групп');
  }

  return data.group;
};