import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { fetchUsers, deleteUserAdmin, updateUserAdmin } from '../../features/users/userManagementSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const UserListScreen = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.userManagement);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const deleteHandler = (id, name) => {
    if (window.confirm(`Delete user "${name}"?`)) {
      dispatch(deleteUserAdmin(id)).then((res) => {
        if (!res.error) toast.success('User deleted');
        else toast.error(res.payload);
      });
    }
  };

  const toggleAdminHandler = (user) => {
    dispatch(updateUserAdmin({ id: user._id, userData: { isAdmin: !user.isAdmin } })).then(
      (res) => {
        if (!res.error) toast.success('User updated');
      }
    );
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Users</h1>
      </div>

      {loading ? (
        <Loader fullPage />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleAdminHandler(user)}
                      disabled={user._id === userInfo._id}
                      style={{ color: user.isAdmin ? 'var(--success)' : 'var(--ink-soft)' }}
                    >
                      {user.isAdmin ? <FaCheckCircle /> : <FaTimesCircle />}
                    </button>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--clay)' }}
                      onClick={() => deleteHandler(user._id, user.name)}
                      disabled={user.isAdmin}
                      aria-label="Delete user"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserListScreen;
