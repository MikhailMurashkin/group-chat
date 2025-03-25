const API_URL = 'http://localhost:3000';

export const createGroup = async (groupName, groupDescription, token) => {
  const response = await fetch(`${API_URL}/groups/createGroup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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

export const getGroupsByUserId = async (token) => {
  const response = await fetch(`${API_URL}/groups/getGroupsByUserId`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  console.log(data.groups)

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось получить список групп');
  }

  return data.groups;
};