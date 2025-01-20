// Load profile data when page loads
async function loadProfileData() {
    try {
        const response = await fetch('http://localhost:3000/api/profile');
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to load profile');
        populateForm(result.data);
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('error', `Error loading profile: ${error.message}`);
    }
}

// Helper function to show alerts
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
    alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
}

// Handle profile photo
function handleProfilePhoto(data, profilePhotoElement) {
    const defaultPhoto = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    profilePhotoElement.src = defaultPhoto;
    
    if (data.profilePhoto) {
        const img = new Image();
        img.onload = () => profilePhotoElement.src = data.profilePhoto;
        img.onerror = () => console.log('Failed to load profile photo, using default');
        img.src = data.profilePhoto;
    }
}

// Populate form with existing data
function populateForm(data) {
    // Basic Info
    handleProfilePhoto(data, document.getElementById('profilePhoto'));
    
    // Text inputs
    ['userName', 'lastName', 'userDescription', 'userEmail', 'userPhone'].forEach(id => {
        document.getElementById(id).value = data[id] || '';
    });

    // Skills
    const skillsContainer = document.getElementById('skillsContainer');
    skillsContainer.innerHTML = '';
    if (data.userSkills) {
        data.userSkills.split(',').map(skill => skill.trim()).forEach(addSkillBadge);
    }

    // Dynamic sections
    populateDynamicSection('experienceContainer', data.experienceContainer, addExperience, {
        'Job Title': 'position',
        'Company Name': 'company_name',
        'start_date': 'start_date',
        'end_date': 'end_date',
        'textarea': 'accomplishments'
    });

    populateDynamicSection('educationContainer', data.educationContainer, addEducation, {
        'Degree Name': 'degree',
        'Institution Name': 'institution_name',
        'YYYY': 'graduation_year',
        'Grade/GPA': 'grade'
    });

    populateDynamicSection('projectsContainer', data.projectsContainer, addProject, {
        'Project Title': 'project_name',
        'start_date': 'start_date',
        'end_date': 'end_date',
        'textarea': 'description'
    });

    populateDynamicSection('socialMediaContainer', data.socialMediaContainer, addSocialMedia, {
        'select': 'platform',
        'url': 'url'
    });
}

// Helper function to populate dynamic sections
function populateDynamicSection(containerId, data, addFunction, fieldMapping) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (data && Array.isArray(data)) {
        data.forEach(() => addFunction());
        data.forEach((item, index) => {
            const element = container.children[index];
            Object.entries(fieldMapping).forEach(([placeholder, dataKey]) => {
                const input = placeholder === 'textarea' ? 
                    element.querySelector('textarea') :
                    placeholder === 'select' ?
                        element.querySelector('select') :
                        placeholder === 'start_date' || placeholder === 'end_date' ?
                            element.querySelector(`input[type="month"]:${placeholder === 'start_date' ? 'first' : 'last'}-of-type`) :
                            element.querySelector(`input[placeholder="${placeholder}"]`);
                if (input) input.value = item[dataKey] || '';
            });
        });
    }
}

// Event Listeners
document.getElementById('photoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => document.getElementById('profilePhoto').src = e.target.result;
        reader.readAsDataURL(file);
    }
});

document.getElementById('skillInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const skill = this.value.trim();
        if (skill) {
            addSkillBadge(skill);
            this.value = '';
        }
    }
});

// Skills Management
function addSkillBadge(skill) {
    const badge = document.createElement('span');
    badge.className = 'skill-badge';
    badge.innerHTML = `${skill}<i class="fas fa-times remove-skill" onclick="this.parentElement.remove()"></i>`;
    document.getElementById('skillsContainer').appendChild(badge);
}

// Dynamic section HTML templates
function addExperience() {
    addDynamicSection('experienceContainer', 'experience-item', `
        <div class="form-group">
            <label>Position</label>
            <input type="text" class="form-control" placeholder="Job Title">
        </div>
        <div class="form-group mt-2">
            <label>Company</label>
            <input type="text" class="form-control" placeholder="Company Name">
        </div>
        <div class="row mt-2">
            <div class="col">
                <label>Start Date</label>
                <input type="month" class="form-control">
            </div>
            <div class="col">
                <label>End Date</label>
                <input type="month" class="form-control">
            </div>
        </div>
        <div class="form-group mt-2">
            <label>Accomplishments</label>
            <textarea class="form-control" rows="3" placeholder="Describe your achievements"></textarea>
        </div>
        <button class="btn btn-danger mt-3 remove-btn" onclick="this.parentElement.remove()">Remove Experience</button>
    `);
}

function addEducation() {
    addDynamicSection('educationContainer', 'education-item', `
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="form-control" placeholder="Degree Name">
        </div>
        <div class="form-group mt-2">
            <label>Institution</label>
            <input type="text" class="form-control" placeholder="Institution Name">
        </div>
        <div class="form-group mt-2">
            <label>Graduation Year</label>
            <input type="text" class="form-control" placeholder="YYYY" maxlength="4" pattern="\\d{4}"
                   oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4)">
        </div>
        <div class="form-group mt-2">
            <label>Grade</label>
            <input type="text" class="form-control" placeholder="Grade/GPA">
        </div>
        <button class="btn btn-danger mt-3 remove-btn" onclick="this.parentElement.remove()">Remove Education</button>
    `);
}

function addProject() {
    addDynamicSection('projectsContainer', 'project-item', `
        <div class="form-group">
            <label>Project Name</label>
            <input type="text" class="form-control" placeholder="Project Title">
        </div>
        <div class="row mt-2">
            <div class="col">
                <label>Start Date</label>
                <input type="month" class="form-control">
            </div>
            <div class="col">
                <label>End Date</label>
                <input type="month" class="form-control">
            </div>
        </div>
        <div class="form-group mt-2">
            <label>Description</label>
            <textarea class="form-control" rows="3" placeholder="Project description"></textarea>
        </div>
        <button class="btn btn-danger mt-3 remove-btn" onclick="this.parentElement.remove()">Remove Project</button>
    `);
}

function addSocialMedia() {
    addDynamicSection('socialMediaContainer', 'social-media-item', `
        <select class="form-control platform-select">
            <option value="linkedin">LinkedIn</option>
            <option value="github">GitHub</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
        </select>
        <input type="url" class="form-control mt-2" placeholder="Profile URL">
        <button class="btn btn-sm btn-danger mt-2 remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `);
}

// Helper function to add dynamic sections
function addDynamicSection(containerId, className, html) {
    const container = document.getElementById(containerId);
    const newItem = document.createElement('div');
    newItem.className = className;
    newItem.innerHTML = html;
    container.appendChild(newItem);
}

// Save profile changes
async function saveProfileChanges() {
    const saveButton = document.querySelector('button[onclick="saveProfileChanges()"]');
    try {
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;

        const formData = {
            profilePhoto: document.getElementById('profilePhoto').src,
            userName: document.getElementById('userName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            userDescription: document.getElementById('userDescription').value.trim(),
            userEmail: document.getElementById('userEmail').value.trim(),
            userPhone: document.getElementById('userPhone').value.trim(),
            userSkills: Array.from(document.getElementById('skillsContainer').getElementsByClassName('skill-badge'))
                .map(badge => badge.textContent.trim()).join(','),
            experienceContainer: getContainerData('experienceContainer', {
                'Job Title': 'position',
                'Company Name': 'company_name',
                'start_month': 'start_date',
                'end_month': 'end_date',
                'textarea': 'accomplishments'
            }),
            educationContainer: getContainerData('educationContainer', {
                'Degree Name': 'degree',
                'Institution Name': 'institution_name',
                'YYYY': 'graduation_year',
                'Grade/GPA': 'grade'
            }),
            projectsContainer: getContainerData('projectsContainer', {
                'Project Title': 'project_name',
                'start_month': 'start_date',
                'end_month': 'end_date',
                'textarea': 'description'
            }),
            socialMediaContainer: getContainerData('socialMediaContainer', {
                'select': 'platform',
                'url': 'url'
            })
        };

        console.log('Profile photo URL:', formData.profilePhoto);
        console.log('Profile photo URL:', formData.profilePhoto);
        const response = await fetch('http://localhost:3000/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to save profile');

        showAlert('success', 'Profile saved successfully!');
        setTimeout(() => window.location.href = 'profile.html', 2000);

    } catch (error) {
        console.error('Error saving profile:', error);
        showAlert('error', `Error saving profile: ${error.message}`);
    } finally {
        saveButton.textContent = 'Save Changes';
        saveButton.disabled = false;
    }
}

// Helper function to get container data
function getContainerData(containerId, fieldMapping) {
    return Array.from(document.getElementById(containerId).children).map(item => {
        const data = {};
        Object.entries(fieldMapping).forEach(([placeholder, key]) => {
            if (placeholder === 'textarea') {
                data[key] = item.querySelector('textarea').value.trim();
            } else if (placeholder === 'select') {
                data[key] = item.querySelector('select').value;
            } else if (placeholder === 'start_month' || placeholder === 'end_month') {
                data[key] = item.querySelector(`input[type="month"]:${placeholder === 'start_month' ? 'first' : 'last'}-of-type`).value;
            } else {
                data[key] = item.querySelector(`input[placeholder="${placeholder}"]`).value.trim();
            }
        });
        return data;
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadProfileData);
