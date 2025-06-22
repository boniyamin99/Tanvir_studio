// backend-api/controllers/employeeController.js

const { User, Employee, Booking } = require('../models'); 
const { logActivity } = require('../utils/activityLogger'); // Log Activity (Update 2, 5)
const bcrypt = require('bcryptjs'); // For password hashing in updateEmployee (Update 3, from previous summary)

// @desc    Add a new employee (Admin/Manager)
// @route   POST /api/employees
// @access  Private (admin, manager)
const addEmployee = async (req, res) => {
  const { username, password, email, fullName, phoneNumber, position, salary, hireDate, shiftType, hoursPerWeek, availableLeaveDays } = req.body;

  if (!username || !password || !fullName || !position || !salary || !hireDate) {
    return res.status(400).json({ message: 'Please fill all required fields for employee.' });
  }

  try {
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a user record for the employee first
    const user = await User.create({
      username,
      password,
      email,
      fullName,
      phoneNumber,
      role: 'employee', // Default role for new employees
    });

    // Then create the employee record linked to the user
    const employee = await Employee.create({
      userId: user.id,
      position,
      salary,
      hireDate,
      shiftType,
      hoursPerWeek,
      availableLeaveDays,
    });

    // --- Applied Update 2: Log Activity (Feature #9) ---
    await logActivity(req.user.id, 'EMPLOYEE_CREATED', `New employee '${fullName}' (ID: ${employee.id}) added by ${req.user.username}.`, {
        targetId: employee.id,
        targetType: 'employee',
        ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Employee added successfully!',
      employee: {
        id: employee.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        position: employee.position,
      },
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    // SequelizeUniqueConstraintError is handled implicitly if unique constraints are set on username/email
    res.status(500).json({ message: 'Server error while adding employee.' });
  }
};

// @desc    Update employee details (Admin/Manager)
// @route   PUT /api/employees/:id
// @access  Private (admin, manager)
const updateEmployee = async (req, res) => {
  const { username, email, fullName, phoneNumber, position, salary, isActive, shiftType, hoursPerWeek, availableLeaveDays, password } = req.body;

  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: { model: User, as: 'userInfo' },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // --- Applied Update 5: Log what changed (for detailed logging) ---
    const oldEmployeeData = JSON.stringify(employee.toJSON()); // Get current data before update

    // Update User info
    let userChanges = [];
    if (employee.userInfo) {
        if (username && employee.userInfo.username !== username) { userChanges.push(`username from '${employee.userInfo.username}' to '${username}'`); employee.userInfo.username = username; }
        if (email && employee.userInfo.email !== email) { userChanges.push(`email from '${employee.userInfo.email}' to '${email}'`); employee.userInfo.email = email; }
        if (fullName && employee.userInfo.fullName !== fullName) { userChanges.push(`full name from '${employee.userInfo.fullName}' to '${fullName}'`); employee.userInfo.fullName = fullName; }
        if (phoneNumber && employee.userInfo.phoneNumber !== phoneNumber) { userChanges.push(`phone number from '${employee.userInfo.phoneNumber}' to '${phoneNumber}'`); employee.userInfo.phoneNumber = phoneNumber; }
        
        // --- Applied Update: Password update logic (from previous summary Idea 3) ---
        if (password) {
            const salt = await bcrypt.genSalt(10);
            employee.userInfo.password = await bcrypt.hash(password, salt);
            userChanges.push('password changed');
        }
        await employee.userInfo.save();
    }

    // Update Employee specific info
    let employeeChanges = [];
    if (position && employee.position !== position) { employeeChanges.push(`position from '${employee.position}' to '${position}'`); employee.position = position; }
    if (salary && employee.salary.toString() !== salary.toString()) { employeeChanges.push(`salary from '${employee.salary}' to '${salary}'`); employee.salary = salary; }
    if (typeof isActive === 'boolean' && employee.isActive !== isActive) { employeeChanges.push(`active status from '${employee.isActive}' to '${isActive}'`); employee.isActive = isActive; }
    if (shiftType && employee.shiftType !== shiftType) { employeeChanges.push(`shift type from '${employee.shiftType}' to '${shiftType}'`); employee.shiftType = shiftType; }
    if (hoursPerWeek && employee.hoursPerWeek !== hoursPerWeek) { employeeChanges.push(`hours per week from '${employee.hoursPerWeek}' to '${hoursPerWeek}'`); employee.hoursPerWeek = hoursPerWeek; }
    if (availableLeaveDays && employee.availableLeaveDays !== availableLeaveDays) { employeeChanges.push(`available leave days from '${employee.availableLeaveDays}' to '${availableLeaveDays}'`); employee.availableLeaveDays = availableLeaveDays; }
    
    await employee.save();

    // --- Applied Update 5: Log Activity (Feature #9) ---
    const changesMade = [...userChanges, ...employeeChanges].join(', ');
    if (changesMade) {
        await logActivity(req.user.id, 'EMPLOYEE_UPDATED', `Updated employee '${fullName || employee.userInfo.fullName}' (ID: ${employee.id}). Changes: ${changesMade}.`, {
            targetId: employee.id,
            targetType: 'employee',
            ipAddress: req.ip
        });
    }


    res.status(200).json({
      message: 'Employee updated successfully!',
      employee,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Username or email already exists.' });
    }
    res.status(500).json({ message: 'Server error while updating employee.' });
  }
};


// @desc    Delete an employee (Admin)
// @route   DELETE /api/employees/:id
// @access  Private (admin)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: { model: User, as: 'userInfo' },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const employeeName = employee.userInfo.fullName;
    const employeeId = employee.id;

    // Delete the associated user record and employee record
    await employee.userInfo.destroy();
    await employee.destroy();

    // --- Applied Update 5: Log Activity (Feature #9) ---
    await logActivity(req.user.id, 'EMPLOYEE_DELETED', `Deleted employee '${employeeName}' (ID: ${employeeId}) by ${req.user.username}.`, {
        targetId: employeeId,
        targetType: 'employee',
        ipAddress: req.ip
    });

    res.status(200).json({ message: 'Employee deleted successfully!' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error while deleting employee.' });
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (admin, manager, accountant)
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: [{ model: User, as: 'userInfo', attributes: ['username', 'email', 'fullName', 'phoneNumber', 'role'] }],
            order: [['userInfo', 'fullName', 'ASC']] // Order by full name from userInfo
        });
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error while fetching employees.' });
    }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private (admin, manager, accountant, employee - with authorization check)
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id, {
            include: [{ model: User, as: 'userInfo', attributes: { exclude: ['password'] } }]
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        // --- Applied Update 6: Authorize employee to only view their own profile ---
        // If an employee (not admin/manager/accountant) tries to view another employee's profile,
        // this check will prevent it.
        if (req.user && req.user.role === 'employee' && employee.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this employee profile.' });
        }

        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        res.status(500).json({ message: 'Server error while fetching employee.' });
    }
};

// --- Applied Update 7: New controller function to get bookings assigned to an employee ---
// @desc    Get all bookings assigned to a specific employee
// @route   GET /api/employees/:id/bookings
// @access  Private (admin, manager, employee)
const getEmployeeBookings = async (req, res) => {
    try {
        const employeeId = req.params.id;

        // --- Applied Update 8: Authorize employee to only view their own assigned bookings ---
        // This prevents an employee from viewing bookings assigned to other employees.
        if (req.user && req.user.role === 'employee' && employeeId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view other employee\'s assigned bookings.' });
        }

        const bookings = await Booking.findAll({
            where: {
                assignedEmployeeId: employeeId
            },
            order: [['bookingDate', 'DESC']],
            include: [
                { model: User, as: 'customer', attributes: ['fullName', 'phoneNumber', 'email'] }
                // Add other includes if needed, e.g., ProjectFile, ProjectMessage
            ]
        });

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching employee assigned bookings:', error);
        res.status(500).json({ message: 'Server error while fetching assigned bookings.' });
    }
};


module.exports = {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees, 
  getEmployeeById, 
  getEmployeeBookings, 
};
