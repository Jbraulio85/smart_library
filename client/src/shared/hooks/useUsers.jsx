import { useState, useEffect } from "react";
import { getUsers } from "../../services/api";

export const useUsers = ({ limit = 10, offset = 0 } = {}) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers({ limite: limit, desde: offset });

      if (res.error) {
        console.warn("Error en la respuesta de getUsers:", res.error);
        setUsers([]);
        setTotal(0);
        return;
      }

      const userList = res.data?.users || [];
      setUsers(userList);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setError(err.message || "Error desconocido");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [limit, offset]);

  return {
    users,
    total,
    loading,
    error,
    refetch: fetchUsers,
  };
};
