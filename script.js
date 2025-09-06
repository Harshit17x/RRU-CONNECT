// Global variables
let currentUser = null;
let currentProfileIndex = 0;
let matches = [];
let conversations = [];
let currentChatUser = null;

// Sample user data (in a real app, this would come from a backend)
const sampleUsers = [
    {
        id: 1,
        name: "Priya Sharma",
        age: 21,
        gender: "female",
        bio: "Computer Science student at RRU. Love coding, music, and late-night study sessions!",
        interests: ["programming", "music", "books", "gaming"],
        location: "RRU Campus",
        occupation: "CS Student",
        image: "👩‍💻"
    },
    {
        id: 2,
        name: "Arjun Patel",
        age: 22,
        gender: "male",
        bio: "Business major and cricket enthusiast. Looking for someone to explore campus life with!",
        interests: ["cricket", "entrepreneurship", "movies", "travel"],
        location: "RRU Campus",
        occupation: "Business Student",
        image: "👨‍🎓"
    },
    {
        id: 3,
        name: "Ananya Singh",
        age: 20,
        gender: "female",
        bio: "Art student passionate about painting and photography. Let's create memories together!",
        interests: ["art", "photography", "dance", "cafe hopping"],
        location: "RRU Campus",
        occupation: "Fine Arts Student",
        image: "👩‍🎨"
    },
    {
        id: 4,
        name: "Rohit Verma",
        age: 23,
        gender: "male",
        bio: "Engineering student and fitness freak. Always up for campus events and sports!",
        interests: ["engineering", "fitness", "football", "tech"],
        location: "RRU Campus",
        occupation: "Engineering Student",
        image: "👨‍🔧"
    },
    {
        id: 5,
        name: "Sneha Gupta",
        age: 21,
        gender: "female",
        bio: "Psychology major who loves reading and deep conversations. Coffee dates anyone?",
        interests: ["psychology", "reading", "coffee", "volunteering"],
        location: "RRU Campus",
        occupation: "Psychology Student",
        image: "👩‍🎓"
    },
    {
        id: 6,
        name: "Vikash Kumar",
        age: 22,
        gender: "male",
        bio: "Medical student with a passion for helping others. Love music and campus festivals!",
        interests: ["medicine", "music", "festivals", "volunteering"],
        location: "RRU Campus",
        occupation: "Medical Student",
        image: "👨‍⚕️"
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showAuthSection();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    
    // Image upload
    document.getElementById('image-input').addEventListener('change', handleImageUpload);
}

// Authentication functions
function showAuthForm(type) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authButtons = document.querySelectorAll('.auth-btn');
    
    authButtons.forEach(btn => btn.classList.remove('active'));
    
    if (type === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        authButtons[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authButtons[1].classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation (in real app, would validate against backend)
    if (email && password) {
        currentUser = {
            id: Date.now(),
            name: "Demo User",
            email: email,
            age: 25,
            gender: "other",
            bio: "Welcome to RRU Connect!",
            interests: ["music", "travel"],
            location: "Your City",
            occupation: "Professional",
            image: "👤"
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Please fill in all fields');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const age = document.getElementById('signup-age').value;
    const gender = document.getElementById('signup-gender').value;
    
    if (name && email && password && age && gender) {
        currentUser = {
            id: Date.now(),
            name: name,
            email: email,
            age: parseInt(age),
            gender: gender,
            bio: "Tell us about yourself...",
            interests: [],
            location: "Your City",
            occupation: "Your Job",
            image: getRandomAvatar(gender)
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Please fill in all fields');
    }
}

function getRandomAvatar(gender) {
    const maleAvatars = ["👨", "👨‍🦱", "👨‍🦳", "👨‍🦲", "👨‍💻", "👨‍🍳"];
    const femaleAvatars = ["👩", "👩‍🦰", "👩‍🦱", "👩‍🦳", "👩‍🦲", "👩‍💻"];
    const otherAvatars = ["👤", "😊", "🙂", "😄"];
    
    if (gender === 'male') {
        return maleAvatars[Math.floor(Math.random() * maleAvatars.length)];
    } else if (gender === 'female') {
        return femaleAvatars[Math.floor(Math.random() * femaleAvatars.length)];
    } else {
        return otherAvatars[Math.floor(Math.random() * otherAvatars.length)];
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    matches = [];
    conversations = [];
    showAuthSection();
}

// Navigation functions
function showAuthSection() {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('app-section').style.display = 'none';
}

function showMainApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    
    // Load user profile data
    loadUserProfile();
    
    // Load discovery cards
    loadNextProfile();
    
    // Load matches
    loadMatches();
    
    // Load conversations
    loadConversations();
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
}

function toggleNav() {
    const nav = document.getElementById('nav');
    nav.classList.toggle('active');
}

// Discovery/Swiping functions
function loadNextProfile() {
    const currentCard = document.getElementById('current-card');
    
    // Filter out already swiped users and matches
    const availableUsers = sampleUsers.filter(user => 
        user.id !== currentUser.id && 
        !matches.some(match => match.id === user.id) &&
        !isUserSwiped(user.id)
    );
    
    if (availableUsers.length === 0) {
        currentCard.innerHTML = `
            <div class="card-image">
                <i class="fas fa-heart-broken" style="font-size: 4rem;"></i>
            </div>
            <div class="card-info">
                <div class="card-name">No more profiles</div>
                <div class="card-details">Check back later for new matches!</div>
            </div>
        `;
        return;
    }
    
    const user = availableUsers[currentProfileIndex % availableUsers.length];
    currentCard.innerHTML = createProfileCard(user);
    currentCard.dataset.userId = user.id;
}

function createProfileCard(user) {
    return `
        <div class="card-image">
            <span style="font-size: 6rem;">${user.image}</span>
        </div>
        <div class="card-info">
            <div class="card-name">${user.name}, ${user.age}</div>
            <div class="card-details">
                <i class="fas fa-map-marker-alt"></i> ${user.location} • 
                <i class="fas fa-briefcase"></i> ${user.occupation}
            </div>
            <div class="card-bio">${user.bio}</div>
            <div class="card-interests">
                ${user.interests.map(interest => `<span class="interest-tag">#${interest}</span>`).join(' ')}
            </div>
        </div>
    `;
}

function swipeCard(action) {
    const currentCard = document.getElementById('current-card');
    const userId = parseInt(currentCard.dataset.userId);
    
    if (!userId) return;
    
    // Save swipe action
    saveSwipeAction(userId, action);
    
    // Add animation class
    currentCard.style.transform = action === 'like' ? 'translateX(100%)' : 
                                 action === 'reject' ? 'translateX(-100%)' : 'translateY(-100%)';
    currentCard.style.opacity = '0';
    
    // Check for match if liked
    if (action === 'like' || action === 'super') {
        checkForMatch(userId);
    }
    
    // Load next profile after animation
    setTimeout(() => {
        currentProfileIndex++;
        loadNextProfile();
        currentCard.style.transform = '';
        currentCard.style.opacity = '1';
    }, 300);
}

function saveSwipeAction(userId, action) {
    let swipedUsers = JSON.parse(localStorage.getItem('swipedUsers') || '{}');
    swipedUsers[userId] = action;
    localStorage.setItem('swipedUsers', JSON.stringify(swipedUsers));
}

function isUserSwiped(userId) {
    const swipedUsers = JSON.parse(localStorage.getItem('swipedUsers') || '{}');
    return swipedUsers.hasOwnProperty(userId);
}

function checkForMatch(userId) {
    // Simulate random match (50% chance)
    if (Math.random() > 0.5) {
        const user = sampleUsers.find(u => u.id === userId);
        if (user) {
            addMatch(user);
            showMatchPopup(user);
        }
    }
}

function addMatch(user) {
    matches.push(user);
    localStorage.setItem('matches', JSON.stringify(matches));
    loadMatches();
}

function showMatchPopup(user) {
    const popup = document.getElementById('match-popup');
    const userImage = document.getElementById('match-user-image');
    const userName = document.getElementById('match-user-name');
    
    userImage.style.fontSize = '4rem';
    userImage.textContent = user.image;
    userName.textContent = user.name;
    
    popup.style.display = 'flex';
}

function closeMatchPopup() {
    document.getElementById('match-popup').style.display = 'none';
}

function sendMessage() {
    closeMatchPopup();
    showSection('messages');
}

// Matches functions
function loadMatches() {
    const savedMatches = localStorage.getItem('matches');
    if (savedMatches) {
        matches = JSON.parse(savedMatches);
    }
    
    const matchesGrid = document.getElementById('matches-grid');
    
    if (matches.length === 0) {
        matchesGrid.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-heart" style="font-size: 3rem; color: var(--gray-color);"></i>
                <p>No matches yet. Keep swiping!</p>
            </div>
        `;
        return;
    }
    
    matchesGrid.innerHTML = matches.map(user => `
        <div class="match-card" onclick="openChat(${user.id})">
            <div class="match-image">
                <span style="font-size: 4rem;">${user.image}</span>
            </div>
            <div class="match-info">
                <div class="match-name">${user.name}</div>
                <div class="match-age">${user.age} years old</div>
            </div>
        </div>
    `).join('');
}

// Messaging functions
function loadConversations() {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
        conversations = JSON.parse(savedConversations);
    }
    
    const conversationsList = document.getElementById('conversations-list');
    
    if (matches.length === 0) {
        conversationsList.innerHTML = `
            <h3>Conversations</h3>
            <div class="no-conversations">
                <p>No conversations yet. Start matching to chat!</p>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = `
        <h3>Conversations</h3>
        ${matches.map(user => {
            const conversation = conversations.find(c => c.userId === user.id);
            const lastMessage = conversation && conversation.messages.length > 0 ? 
                conversation.messages[conversation.messages.length - 1] : null;
            
            return `
                <div class="conversation-item" onclick="openChat(${user.id})">
                    <div class="conversation-avatar">
                        <span style="font-size: 1.5rem;">${user.image}</span>
                    </div>
                    <div class="conversation-info">
                        <h4>${user.name}</h4>
                        <p class="conversation-preview">
                            ${lastMessage ? lastMessage.content : 'Start a conversation...'}
                        </p>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function openChat(userId) {
    const user = matches.find(u => u.id === userId);
    if (!user) return;
    
    currentChatUser = user;
    
    // Update active conversation
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.conversation-item').classList.add('active');
    
    // Load chat interface
    const chatArea = document.getElementById('chat-area');
    chatArea.innerHTML = `
        <div class="chat-header">
            <div class="conversation-avatar">
                <span style="font-size: 1.5rem;">${user.image}</span>
            </div>
            <div class="conversation-info">
                <h4>${user.name}</h4>
                <p>Online now</p>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages">
            ${loadChatMessages(userId)}
        </div>
        <div class="chat-input">
            <input type="text" id="message-input" placeholder="Type a message..." onkeypress="handleMessageKeypress(event)">
            <button onclick="sendChatMessage()">Send</button>
        </div>
    `;
    
    // Scroll to bottom
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadChatMessages(userId) {
    const conversation = conversations.find(c => c.userId === userId);
    
    if (!conversation || conversation.messages.length === 0) {
        return '<div style="text-align: center; color: var(--gray-color); padding: 2rem;">Say hello! 👋</div>';
    }
    
    return conversation.messages.map(message => `
        <div class="message ${message.sender === 'user' ? 'sent' : ''}">
            <div class="message-content">
                ${message.content}
            </div>
        </div>
    `).join('');
}

function handleMessageKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const messageInput = document.getElementById('message-input');
    const messageContent = messageInput.value.trim();
    
    if (!messageContent || !currentChatUser) return;
    
    // Find or create conversation
    let conversation = conversations.find(c => c.userId === currentChatUser.id);
    if (!conversation) {
        conversation = {
            userId: currentChatUser.id,
            messages: []
        };
        conversations.push(conversation);
    }
    
    // Add message
    conversation.messages.push({
        content: messageContent,
        sender: 'user',
        timestamp: new Date().toISOString()
    });
    
    // Save conversations
    localStorage.setItem('conversations', JSON.stringify(conversations));
    
    // Clear input
    messageInput.value = '';
    
    // Reload chat
    openChat(currentChatUser.id);
    
    // Simulate response after a delay
    setTimeout(() => {
        simulateResponse(currentChatUser.id);
    }, 1000 + Math.random() * 2000);
}

function simulateResponse(userId) {
    const responses = [
        "That sounds great! 😊",
        "I'd love to hear more about that!",
        "Haha, that's interesting!",
        "What do you think about trying that new restaurant?",
        "I'm having a great time chatting with you!",
        "Tell me more about your hobbies!",
        "That's so cool! I've always wanted to try that.",
        "You seem really fun to be around! ✨"
    ];
    
    let conversation = conversations.find(c => c.userId === userId);
    if (conversation) {
        conversation.messages.push({
            content: responses[Math.floor(Math.random() * responses.length)],
            sender: 'match',
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('conversations', JSON.stringify(conversations));
        
        // Reload chat if current user
        if (currentChatUser && currentChatUser.id === userId) {
            openChat(userId);
        }
        
        // Update conversations list
        loadConversations();
    }
}

// Profile functions
function loadUserProfile() {
    if (!currentUser) return;
    
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-age').textContent = `${currentUser.age} years old`;
    document.getElementById('profile-image').style.fontSize = '6rem';
    document.getElementById('profile-image').textContent = currentUser.image;
    
    // Fill form fields
    document.getElementById('edit-name').value = currentUser.name || '';
    document.getElementById('edit-age').value = currentUser.age || '';
    document.getElementById('edit-bio').value = currentUser.bio || '';
    document.getElementById('edit-interests').value = currentUser.interests?.join(', ') || '';
    document.getElementById('edit-location').value = currentUser.location || '';
    document.getElementById('edit-occupation').value = currentUser.occupation || '';
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    // Update user data
    currentUser.name = document.getElementById('edit-name').value;
    currentUser.age = parseInt(document.getElementById('edit-age').value);
    currentUser.bio = document.getElementById('edit-bio').value;
    currentUser.interests = document.getElementById('edit-interests').value.split(',').map(i => i.trim()).filter(i => i);
    currentUser.location = document.getElementById('edit-location').value;
    currentUser.occupation = document.getElementById('edit-occupation').value;
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update display
    loadUserProfile();
    
    // Show success message
    alert('Profile updated successfully!');
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileImage = document.getElementById('profile-image');
            profileImage.innerHTML = `<img src="${e.target.result}" alt="Profile">`;
            
            // Save image data (in a real app, this would be uploaded to a server)
            if (currentUser) {
                currentUser.imageData = e.target.result;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        };
        reader.readAsDataURL(file);
    }
}

// Utility functions
function getTimeAgo(timestamp) {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

// Add some sample matches for demo purposes
function initializeDemoData() {
    if (localStorage.getItem('demoInitialized')) return;
    
    // Add a few sample matches
    const demoMatches = sampleUsers.slice(0, 3);
    localStorage.setItem('matches', JSON.stringify(demoMatches));
    
    // Add sample conversations
    const demoConversations = [
        {
            userId: demoMatches[0].id,
            messages: [
                { content: "Hi there! 👋", sender: "match", timestamp: new Date(Date.now() - 3600000).toISOString() },
                { content: "Hello! Nice to meet you!", sender: "user", timestamp: new Date(Date.now() - 3500000).toISOString() },
                { content: "How's your day going?", sender: "match", timestamp: new Date(Date.now() - 3400000).toISOString() }
            ]
        }
    ];
    localStorage.setItem('conversations', JSON.stringify(demoConversations));
    localStorage.setItem('demoInitialized', 'true');
}
