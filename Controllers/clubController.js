const Club = require('../models/clubModel'); // Adjust the path as necessary

exports.getClubMembers = async (req, res) => {
    try {
        const clubId = req.params.id; // Assuming the route is /:id/members

        // Fetch the club and populate the 'members' field with specific fields
        const club = await Club.findById(clubId)
            .populate('members', 'name email profilePicture'); // Adjust fields as necessary

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Check if there are members
        if (!club.members || club.members.length === 0) {
            return res.status(200).json({ message: 'No members found for this club' });
        }

        res.status(200).json(club.members);
    } catch (error) {
        console.error("Error fetching club members:", error);
        res.status(500).json({ message: 'Error fetching club members', error: error.message });
    }
};


// Fetch activities of a specific club
exports.getClubActivities = async (req, res) => {
    try {
        const clubId = req.params.id; // Assuming the route is /:id/activities
        const club = await Club.findById(clubId).populate('events', 'title description date'); // Adjust fields as necessary

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        res.status(200).json(club.events);
    } catch (error) {
        console.error("Error fetching club activities:", error);
        res.status(500).json({ message: 'Error fetching club activities', error: error.message });
    }
};

// Create a new club
exports.createClub = async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: No user information found.' });
        }

        // Destructure necessary fields from the request body
        const { name, clubAccount } = req.body;
        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: 'Club Name and Leader are required.' });
        }

        // Set default description if not provided
        const description = req.body.description ? req.body.description : "No description provided.";

        // Create a new club instance with the provided data
        const club = new Club({
            name: name,
            description,
            createdBy: req.user._id, // Set the creator as the authenticated user
            // Optionally, add the creator to the members list
            members: [req.user._id],

            // Initialize other fields as needed
            clubAccount: clubAccount
        });

        // Save the club to the database
        const savedClub = await club.save();

        res.status(201).json(savedClub);
    } catch (error) {
        console.error("Error creating club:", error);
        res.status(400).json({ message: 'Error creating club', error: error.message });
    }
};


// Get all clubs
exports.getAllClubs = async (req, res) => {
    try {
        const clubs = await Club.find().populate('createdBy', 'name email').populate('members', 'name email').populate('events', 'title date');
        res.status(200).json(clubs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving clubs', error });
    }
};

// Get a single club by ID
exports.getClubById = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('members', 'name email')
            .populate('events', 'title date');
        if (!club) return res.status(404).json({ message: 'Club not found' });
        res.status(200).json(club);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving club', error });
    }
};

// Update a club by ID
exports.updateClub = async (req, res) => {
    try {
        const updatedClub = await Club.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!updatedClub) return res.status(404).json({ message: 'Club not found' });
        res.status(200).json(updatedClub);
    } catch (error) {
        res.status(400).json({ message: 'Error updating club', error });
    }
};

// Delete a club by ID
exports.deleteClub = async (req, res) => {
    try {
        const deletedClub = await Club.findByIdAndDelete(req.params.id);
        if (!deletedClub) return res.status(404).json({ message: 'Club not found' });
        res.status(200).json({ message: 'Club deleted successfully', deletedClub });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting club', error });
    }
};


exports.deleteClubMember = async (req, res) => {
    try {
        const { clubId, memberId } = req.body; // Get the clubId and memberId from the request body

        // Find the club by ID and populate the members field if needed
        const club = await Club.findById(clubId).populate('members', 'name email profilePicture');

        // If the club is not found, return an error
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Use the $pull operator to remove the member from the members array
        await Club.updateOne(
            { _id: clubId },
            { $pull: { members: { _id: memberId } } }
        );

        // Respond with the updated club members
        const updatedClub = await Club.findById(clubId).populate('members', 'name email profilePicture');
        res.status(200).json(updatedClub.members);
    } catch (error) {
        console.error("Error deleting club member:", error);
        res.status(500).json({ message: 'Error deleting club member', error: error.message });
    }
};


// Add member to a club
exports.addMemberToClub = async (req, res) => {
    try {
        const { clubId, memberId } = req.body; // Get clubId and memberId from the request body

        // Find the club by ID
        const club = await Club.findById(clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Check if the member already exists in the club
        if (club.members.includes(memberId)) {
            return res.status(400).json({ message: 'Member is already in the club' });
        }

        // Add member to the club's members array
        club.members.push(memberId);

        // Update the updatedAt field
        club.updatedAt = Date.now();

        // Save the club with the new member
        await club.save();

        // Return the updated club information
        const updatedClub = await Club.findById(clubId).populate('members', 'name email profilePicture');
        res.status(200).json(updatedClub.members);
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ message: 'Error adding member', error: error.message });
    }
};

exports.addClubActivites = async () => {
    try {
        const { clubId, memberId } = req.body; // Get clubId and memberId from the request body

        // Find the club by ID
        const club = await Club.findById(clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Check if the member already exists in the club
        if (club.members.includes(memberId)) {
            return res.status(400).json({ message: 'Member is already in the club' });
        }

        // Add member to the club's members array
        club.members.push(memberId);

        // Update the updatedAt field
        club.updatedAt = Date.now();

        // Save the club with the new member
        await club.save();

        // Return the updated club information
        const updatedClub = await Club.findById(clubId).populate('members', 'name email profilePicture');
        res.status(200).json(updatedClub.members);
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ message: 'Error adding member', error: error.message });
    }
}
