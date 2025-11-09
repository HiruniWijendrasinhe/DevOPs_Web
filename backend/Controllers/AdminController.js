import { getAllUsers, updateUserRole, updateUserTeam } from "../Models/User.js";

// Get all users (admin only)
export const getUsersController = async (req, res) => {
  try {
    console.log("Fetching all users for admin");
    const users = await getAllUsers();
    
    // Format response to match frontend expectations
    const formattedUsers = users.map(user => ({
      ID: user.ID,
      User_Name: user.User_Name,
      Email: user.Email,
      Profile_Url: user.Profile_Url,
      Team: user.Team,
      Role: user.Role
      
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user role
export const updateUserRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    console.log(`Updating user ${id} role to:`, role);

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    await updateUserRole(id, role);
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user team
export const updateUserTeamController = async (req, res) => {
  try {
    const { id } = req.params;
    const { team } = req.body;

    console.log(`Updating user ${id} team to:`, team);

    const validTeams = ['Development', 'QA', 'Finance', 'HR', 'Operations'];
    if (!validTeams.includes(team)) {
      return res.status(400).json({ message: "Invalid team" });
    }

    await updateUserTeam(id, team);
    res.status(200).json({ message: "User team updated successfully" });
  } catch (error) {
    console.error("Error updating user team:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};