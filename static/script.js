// State variables
let allNotes = [];
let selectedNotes = [];

// DOM Elements
const notesContainer = document.getElementById('notes-container');
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const errorMsg = document.getElementById('error-msg');
const statusText = document.getElementById('status-text');
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');
const tweetTextarea = document.getElementById('tweet-text');
const charCounter = document.getElementById('char-counter');
const selectedList = document.getElementById('selected-list');
const clearSelectionsBtn = document.getElementById('clear-selections-btn');

// Page Load initialization
document.addEventListener('DOMContentLoaded', () => {
    loadNotes(false);
    
    // Character counter event listener
    tweetTextarea.addEventListener('input', updateCharCount);
});

// Load notes from Flask backend
async function loadNotes(forceFresh = false) {
    // UI state updates
    setLoading(true);
    errorContainer.style.display = 'none';
    
    const url = forceFresh ? '/api/notes?refresh=true' : '/api/notes';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        allNotes = data.notes || [];
        statusText.innerHTML = `Loaded ${allNotes.length} updates. Source: <strong style="color:var(--accent-blue);">${data.source === 'cache' ? 'Cache' : 'Fresh Feed'}</strong>`;
        
        renderNotes(allNotes);
    } catch (error) {
        console.error("Error loading release notes:", error);
        errorMsg.textContent = error.message || "Could not connect to the local Flask server.";
        errorContainer.style.display = 'flex';
        notesContainer.innerHTML = '';
        statusText.textContent = "Failed to load updates.";
    } finally {
        setLoading(false);
    }
}

// Set Loading UI State
function setLoading(isLoading) {
    if (isLoading) {
        loadingContainer.style.display = 'flex';
        notesContainer.style.display = 'none';
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
    } else {
        loadingContainer.style.display = 'none';
        notesContainer.style.display = 'flex';
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
    }
}

// Helper to determine type pill and clean content
function parseNoteType(content) {
    // Try to parse <h3>Type</h3> structure
    const h3Match = content.match(/<h3>(.*?)<\/h3>/i);
    let type = "General";
    if (h3Match && h3Match[1]) {
        type = h3Match[1].trim();
    }
    
    // Set appropriate CSS class
    let pillClass = "pill-general";
    const typeLower = type.toLowerCase();
    if (typeLower.includes("feature")) {
        pillClass = "pill-feature";
    } else if (typeLower.includes("change") || typeLower.includes("update")) {
        pillClass = "pill-changed";
    } else if (typeLower.includes("deprecat")) {
        pillClass = "pill-deprecated";
    }
    
    return { type, pillClass };
}

// Clean HTML text for preview snippet in tweet builder
function getCleanText(htmlContent) {
    // Create temporary element to extract clean text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    
    // Remove h3 if any
    const h3 = tempDiv.querySelector('h3');
    if (h3) h3.remove();
    
    let text = tempDiv.textContent || tempDiv.innerText || "";
    // Clean up extra whitespaces/newlines
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}

// Render release notes to DOM
function renderNotes(notes) {
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-msg" style="padding: 3rem; font-size: 1rem;">
                <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem; display: block;"></i>
                No release notes found matching your search.
            </div>
        `;
        return;
    }
    
    notes.forEach((note, index) => {
        const { type, pillClass } = parseNoteType(note.content);
        const isChecked = selectedNotes.some(sn => sn.id === note.id);
        
        const card = document.createElement('div');
        card.className = `note-card ${isChecked ? 'selected' : ''}`;
        card.id = `card-${index}`;
        
        card.innerHTML = `
            <div class="note-select">
                <label class="custom-checkbox">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSelect(${index})">
                    <span class="checkmark"></span>
                </label>
            </div>
            <div class="note-body">
                <div class="note-meta">
                    <span class="note-date">${note.title}</span>
                    <span class="note-type-pill ${pillClass}">${type}</span>
                </div>
                <div class="note-html-content">
                    ${note.content}
                </div>
                <div class="note-actions">
                    <button class="btn btn-secondary btn-sm btn-card-tweet" onclick="tweetSingleNote(${index})">
                        <i class="fa-brands fa-x-twitter"></i> Tweet This
                    </button>
                </div>
            </div>
        `;
        notesContainer.appendChild(card);
    });
}

// Handle checkbox selection
function toggleSelect(index) {
    const note = allNotes[index];
    const card = document.getElementById(`card-${index}`);
    const checkbox = card.querySelector('input[type="checkbox"]');
    
    const isSelected = checkbox.checked;
    
    if (isSelected) {
        selectedNotes.push(note);
        card.classList.add('selected');
    } else {
        selectedNotes = selectedNotes.filter(sn => sn.id !== note.id);
        card.classList.remove('selected');
    }
    
    updateTweetComposer();
}

// Update Tweet composer based on selected items
function updateTweetComposer() {
    // Update selected notes list tracker
    selectedList.innerHTML = '';
    
    if (selectedNotes.length === 0) {
        selectedList.className = 'selected-list-empty';
        selectedList.innerHTML = `<li class="empty-msg">No updates selected. Click the checkbox on any update card to draft a tweet.</li>`;
        clearSelectionsBtn.style.display = 'none';
        tweetTextarea.value = '';
        updateCharCount();
        return;
    }
    
    selectedList.className = '';
    clearSelectionsBtn.style.display = 'inline-flex';
    
    selectedNotes.forEach((note) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${note.title}</strong> - ${getCleanText(note.content).substring(0, 40)}...</span>
            <button onclick="removeSelectionById('${note.id}')"><i class="fa-solid fa-xmark"></i></button>
        `;
        selectedList.appendChild(li);
    });
    
    // Auto-generate tweet draft
    let draftText = "";
    if (selectedNotes.length === 1) {
        const note = selectedNotes[0];
        const { type } = parseNoteType(note.content);
        const cleanText = getCleanText(note.content);
        // Truncate cleanText to fit nicely in 280 chars limit with hashtag/url
        const textLimit = 160;
        const textSnippet = cleanText.length > textLimit ? cleanText.substring(0, textLimit) + "..." : cleanText;
        
        draftText = `Google Cloud #BigQuery Update (${note.title}):\n\n[${type}] ${textSnippet}\n\nDetails: ${note.link}`;
    } else {
        // Multi-select draft
        draftText = `Latest Google Cloud #BigQuery updates:\n`;
        selectedNotes.forEach(note => {
            const { type } = parseNoteType(note.content);
            const cleanText = getCleanText(note.content);
            const shortText = cleanText.length > 50 ? cleanText.substring(0, 50) + "..." : cleanText;
            draftText += `\n• [${note.title}] ${shortText}`;
        });
        
        // Take the link of the first update as primary reference
        if (selectedNotes.length > 0) {
            draftText += `\n\nRead more: https://docs.cloud.google.com/bigquery/docs/release-notes`;
        }
    }
    
    tweetTextarea.value = draftText;
    updateCharCount();
}

// Remove selection by ID
function removeSelectionById(id) {
    selectedNotes = selectedNotes.filter(sn => sn.id !== id);
    
    // Re-render notes to reflect checkbox changes
    renderNotes(allNotes);
    updateTweetComposer();
}

// Clear all selections
function clearSelections() {
    selectedNotes = [];
    renderNotes(allNotes);
    updateTweetComposer();
}

// Directly Tweet a single note
function tweetSingleNote(index) {
    const note = allNotes[index];
    const { type } = parseNoteType(note.content);
    const cleanText = getCleanText(note.content);
    const textLimit = 180;
    const textSnippet = cleanText.length > textLimit ? cleanText.substring(0, textLimit) + "..." : cleanText;
    
    const draftText = `Google Cloud #BigQuery Update (${note.title}):\n\n[${type}] ${textSnippet}\n\nDetails: ${note.link}`;
    
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(draftText)}`;
    window.open(tweetUrl, '_blank');
}

// Publish/Tweet text inside composer
function publishTweet() {
    const tweetContent = tweetTextarea.value.trim();
    if (!tweetContent) {
        alert("Please write or select an update to tweet first!");
        return;
    }
    
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
    window.open(tweetUrl, '_blank');
}

// Update char count badge and warning styles
function updateCharCount() {
    const text = tweetTextarea.value;
    const remaining = 280 - text.length;
    
    charCounter.textContent = remaining;
    
    // Manage colors based on text length
    charCounter.className = 'char-count';
    if (remaining < 0) {
        charCounter.classList.add('danger');
    } else if (remaining < 40) {
        charCounter.classList.add('warning');
    }
}

// Search / Filter updates list
function filterNotes() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!query) {
        renderNotes(allNotes);
        return;
    }
    
    const filtered = allNotes.filter(note => {
        const cleanContent = getCleanText(note.content).toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(query);
        const contentMatch = cleanContent.includes(query);
        
        // Check if it matches update type too
        const { type } = parseNoteType(note.content);
        const typeMatch = type.toLowerCase().includes(query);
        
        return titleMatch || contentMatch || typeMatch;
    });
    
    renderNotes(filtered);
}
