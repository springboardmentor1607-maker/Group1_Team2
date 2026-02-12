<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard | Clean Street</title>
    <link rel="stylesheet" href="admin-dashboard.css">
</head>
<body>

    <!-- Sidebar -->
    <div class="sidebar">
        <h2>Clean Street</h2>
        <ul>
            <li>Dashboard</li>
            <li>Complaints</li>
            <li>Users</li>
            <li>Reports</li>
            <li>Logout</li>
        </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <h1>Admin Dashboard</h1>

        <!-- Stats Cards -->
        <div class="stats">
            <div class="card">
                <h3>Total Complaints</h3>
                <p>120</p>
            </div>
            <div class="card">
                <h3>In Review</h3>
                <p>45</p>
            </div>
            <div class="card">
                <h3>Resolved</h3>
                <p>60</p>
            </div>
            <div class="card">
                <h3>Users</h3>
                <p>300</p>
            </div>
        </div>

        <!-- Complaints Table -->
        <h2>Recent Complaints</h2>
        <table>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Assigned To</th>
            </tr>
            <tr>
                <td>101</td>
                <td>Garbage Overflow</td>
                <td>In Review</td>
                <td>Municipality</td>
            </tr>
            <tr>
                <td>102</td>
                <td>Pothole Issue</td>
                <td>Resolved</td>
                <td>Road Dept</td>
            </tr>
            <tr>
                <td>103</td>
                <td>Streetlight Not Working</td>
                <td>Received</td>
                <td>Electricity Board</td>
            </tr>
        </table>

    </div>

</body>
</html>
