import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get, update, query, orderByChild, equalTo, push, remove, onChildAdded, limitToLast } from "firebase/database";
import { auth, database } from "./firebase";

// Validation constants
const VALID_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript',
  'HTML', 'CSS', 'React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Git',
  'Kotlin', 'Swift', 'R', 'MATLAB', 'Scala', 'Perl', 'Dart', 'Lua', 'Bash', 'PowerShell',
  'GraphQL', 'Next.js', 'Nuxt', 'Django', 'Flask', 'ASP.NET'
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

export const validationService = {
  validateEmail: (email) => {
    if (!email) return { valid: false, error: 'Email is required' };
    if (!EMAIL_REGEX.test(email)) return { valid: false, error: 'Invalid email format' };
    return { valid: true };
  },

  validatePassword: (password) => {
    if (!password) return { valid: false, error: 'Password is required' };
    if (password.length < PASSWORD_MIN_LENGTH) {
      return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
    }
    return { valid: true };
  },

  validateName: (name) => {
    if (!name || !name.trim()) return { valid: false, error: 'Name is required' };
    if (name.trim().length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    return { valid: true };
  },

  validateSkill: (skill) => {
    if (!skill || !skill.trim()) return { valid: false, error: 'Skill is required' };
    if (!VALID_SKILLS.includes(skill.trim())) {
      return { valid: false, error: 'Selected skill is not in the allowed list' };
    }
    return { valid: true };
  },

  getValidSkills: () => VALID_SKILLS
};

export const authService = {
  signup: async (email, password, name, skillOffer, skillLearn) => {
    try {
      // Validate inputs
      const emailVal = validationService.validateEmail(email);
      if (!emailVal.valid) return { success: false, error: emailVal.error };

      const passwordVal = validationService.validatePassword(password);
      if (!passwordVal.valid) return { success: false, error: passwordVal.error };

      const nameVal = validationService.validateName(name);
      if (!nameVal.valid) return { success: false, error: nameVal.error };

      const skillOfferVal = validationService.validateSkill(skillOffer);
      if (!skillOfferVal.valid) return { success: false, error: `Skill to offer: ${skillOfferVal.error}` };

      const skillLearnVal = validationService.validateSkill(skillLearn);
      if (!skillLearnVal.valid) return { success: false, error: `Skill to learn: ${skillLearnVal.error}` };

      // Check if email already exists (by trying to sign up)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Save user data to database
      await set(ref(database, "users/" + uid), {
        name: name.trim(),
        email: email.trim(),
        offer: skillOffer.trim(),
        learn: skillLearn.trim(),
        createdAt: new Date().toISOString(),
        avgRating: 1,
        totalRatings: 0,
        sessionsCompleted: 0,
        bio: ''
      });
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      return { success: false, error: message };
    }
  },

  login: async (email, password) => {
    try {
      const emailVal = validationService.validateEmail(email);
      if (!emailVal.valid) return { success: false, error: emailVal.error };

      const passwordVal = validationService.validatePassword(password);
      if (!passwordVal.valid) return { success: false, error: passwordVal.error };

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let message = error.message;
      if (error.code === 'auth/user-not-found') {
        message = 'Email not registered. Please sign up instead.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many login attempts. Please try again later.';
      }
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        resolve(user);
        unsubscribe();
      });
    });
  },

  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

export const userService = {
  getUser: async (uid) => {
    try {
      const snapshot = await get(ref(database, `users/${uid}`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  updateUser: async (uid, updates) => {
    try {
      await update(ref(database, `users/${uid}`), updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getUsersExceptCurrent: async (currentUid) => {
    try {
      const snapshot = await get(ref(database, 'users'));
      if (!snapshot.exists()) return [];
      
      const users = [];
      snapshot.forEach((child) => {
        if (child.key !== currentUid) {
          users.push({
            uid: child.key,
            ...child.val()
          });
        }
      });
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }
};

export const requestService = {
  createRequest: async (fromUid, toUid, requestedSkill, offeredSkill) => {
    try {
      const requestData = {
        fromUid,
        toUid,
        requestedSkill,
        offeredSkill,
        status: 'pending',
        createdAt: new Date().toISOString(),
        fromName: '',
        toName: ''
      };

      // Get sender and receiver names
      const fromUser = await userService.getUser(fromUid);
      const toUser = await userService.getUser(toUid);
      requestData.fromName = fromUser?.name || 'Unknown';
      requestData.toName = toUser?.name || 'Unknown';

      const requestsRef = ref(database, 'requests');
      const newRequestRef = push(requestsRef);
      await set(newRequestRef, requestData);

      return { success: true, requestId: newRequestRef.key };
    } catch (error) {
      console.error("Error creating request:", error);
      return { success: false, error: error.message };
    }
  },

  getIncomingRequests: async (uid) => {
    try {
      const snapshot = await get(ref(database, 'requests'));
      if (!snapshot.exists()) return [];

      const requests = [];
      snapshot.forEach((child) => {
        const req = child.val();
        if (req.toUid === uid && req.status === 'pending') {
          requests.push({
            id: child.key,
            ...req
          });
        }
      });
      return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      return [];
    }
  },

  getSentRequests: async (uid) => {
    try {
      const snapshot = await get(ref(database, 'requests'));
      if (!snapshot.exists()) return [];

      const requests = [];
      snapshot.forEach((child) => {
        const req = child.val();
        if (req.fromUid === uid) {
          requests.push({
            id: child.key,
            ...req
          });
        }
      });
      return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      return [];
    }
  },

  acceptRequest: async (requestId, currentUid) => {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      const requestSnapshot = await get(requestRef);
      
      if (!requestSnapshot.exists()) {
        return { success: false, error: 'Request not found' };
      }

      const request = requestSnapshot.val();
      if (request.toUid !== currentUid) {
        return { success: false, error: 'Unauthorized' };
      }

      // Update request status
      await update(requestRef, { status: 'accepted' });

      // Create session
      const sessionData = {
        initiatorUid: request.fromUid,
        mentorUid: request.toUid,
        skillLearning: request.requestedSkill,
        skillTeaching: request.offeredSkill,
        status: 'active',
        createdAt: new Date().toISOString(),
        messages: []
      };

      const sessionsRef = ref(database, 'sessions');
      const newSessionRef = push(sessionsRef);
      await set(newSessionRef, sessionData);

      return { success: true, sessionId: newSessionRef.key };
    } catch (error) {
      console.error("Error accepting request:", error);
      return { success: false, error: error.message };
    }
  },

  rejectRequest: async (requestId, currentUid) => {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      const requestSnapshot = await get(requestRef);
      
      if (!requestSnapshot.exists()) {
        return { success: false, error: 'Request not found' };
      }

      const request = requestSnapshot.val();
      if (request.toUid !== currentUid) {
        return { success: false, error: 'Unauthorized' };
      }

      await update(requestRef, { status: 'rejected' });
      return { success: true };
    } catch (error) {
      console.error("Error rejecting request:", error);
      return { success: false, error: error.message };
    }
  },

  getChatKey: async (uid1, uid2) => {
    const key = [uid1, uid2].sort().join('_');
    return key;
  }
};

export const chatService = {
  sendMessage: async (chatId, fromUid, message) => {
    try {
      const messageData = {
        fromUid,
        text: message.trim(),
        timestamp: new Date().toISOString(),
        read: false
      };

      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, messageData);

      // Update chat last message
      await update(ref(database, `chats/${chatId}`), {
        lastMessage: message.trim(),
        lastMessageTime: messageData.timestamp
      });

      return { success: true };
    } catch (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }
  },

  getMessages: (chatId, callback) => {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, limitToLast(50)); // Get last 50 messages
    
    return onChildAdded(messagesQuery, (snapshot) => {
      const message = {
        id: snapshot.key,
        ...snapshot.val()
      };
      callback(message);
    });
  },

  getChats: async (uid) => {
    try {
      const snapshot = await get(ref(database, 'chats'));
      if (!snapshot.exists()) return [];

      const chats = [];
      snapshot.forEach((child) => {
        const chat = child.val();
        const [uid1, uid2] = child.key.split('_');
        
        if (uid1 === uid || uid2 === uid) {
          const otherUid = uid1 === uid ? uid2 : uid1;
          chats.push({
            id: child.key,
            otherUid,
            ...chat
          });
        }
      });

      return chats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    }
  },

  startChat: async (uid1, uid2, fromName, toName) => {
    try {
      const chatKey = [uid1, uid2].sort().join('_');
      const chatRef = ref(database, `chats/${chatKey}`);
      
      await set(chatRef, {
        uid1,
        uid2,
        uid1Name: uid1 === [uid1, uid2].sort()[0] ? fromName : toName,
        uid2Name: uid2 === [uid1, uid2].sort()[0] ? fromName : toName,
        createdAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageTime: new Date().toISOString()
      });

      return { success: true, chatKey };
    } catch (error) {
      console.error("Error starting chat:", error);
      return { success: false, error: error.message };
    }
  }
};
