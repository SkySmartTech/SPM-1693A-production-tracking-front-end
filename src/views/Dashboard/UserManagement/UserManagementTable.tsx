import React from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Typography
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface User {
  id: number;
  epf: string;
  employeeName: string;
  username: string;
  password: string;
  department: string;
  contact: string;
  email: string;
  userType: string;
  availability: string;
}

interface UserManagementTableProps {
  users: User[];
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ users, handleEdit, handleDelete }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        User List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {[
                "ID",
                "EPF",
                "Employee Name",
                "Username",
                "Department",
                "Contact",
                "Email",
                "User Type",
                "Status",
                "Actions"
              ].map((header) => (
                <TableCell key={header} sx={{ fontWeight: "bold" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.epf}</TableCell>
                  <TableCell>{user.employeeName}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.contact}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.userType}</TableCell>
                  <TableCell>{user.availability}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(user.id)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No users available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default UserManagementTable;
