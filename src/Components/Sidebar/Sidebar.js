export const getMenuItems = async () => {
    const response = [
        {
            "id": 1,
            "label": "Dashboard",
            "icon": "hi-view-grid",
            "url": "/dashboard"
        },
        {
            "id": 2,
            "label": "Users",
            "icon": "bi-people",
            "children": [
                {
                    "id": 21,
                    "label": "User List",
                    "url": "/users/list"
                },
                {
                    "id": 22,
                    "label": "Add User",
                    "url": "/users/add"
                }
            ]
        },
        {
            "id": 3,
            "label": "Settings",
            "icon": "bi-gear",
            "children": [
                {
                    "id":31,
                    "label":"Roles & Permission",
                    "url":"/settings/roles"
                },
                {
                    "id": 32,
                    "label": "Profile",
                    "url": "/settings/profile"
                },
                {
                    "id": 33,
                    "label": "Security",
                    "url": "/settings/security"
                },
                {
                    "id": 34,
                    "label": "General",
                    "url": "/settings/general"
                },
                {
                    "id": 35,
                    "label": "Holidays",
                    "url": "/settings/holidays"
                },
                {
                    "id": 36,
                    "label": "Department",
                    "url": "/settings/department"
                },
                {
                    "id": 37,
                    "label": "Designation",
                    "url": "/settings/designation"
                }
            ]
        },
        {
            "id": 4,
            "label": "Configration",
            "icon": "bi-gear",
            "children": [
                {
                    "id":41,
                    "label":"Business",
                    "url":"/configuration/business"
                },
            ]
        }
    ]

    return response;
};
