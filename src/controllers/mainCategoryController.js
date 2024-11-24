import Event from "../models/events.js";
import Folder from "../models/folders.js";
import photo from "../models/photo.js";
import { errorResponse, successResponse } from "../utils/responseWrapper.js";

export const getAlbumData = async (req, res) => {
    try {
        const { eventNumber } = req.query;
        if(!eventNumber) {
            return errorResponse(res, 'Event number is required');
        }
        
        const event = await Event.findOne({ eventNumber });
        if(!event) {
            return errorResponse(res, 'Event not found');
        }

        const data = {
            id: event._id,
            mainCategoryName: event.name,
            mainCategoryImage: event.eventPicture,
            subCategories: []
        };

        const subCategories = await Folder.find({ eventId: event._id });
        
        const subCategoryPromises = subCategories.map(async (subCategory) => {
            const photos = await photo.find(
                { 
                    eventId: event._id, 
                    folderId: subCategory._id 
                }, 
                { url: 1, _id: 1 }
            ).lean();

            return {
                id: subCategory._id,
                name: subCategory.name,
                image: subCategory.folderPicture ?? photos[0].url,
                subCategoryImages: photos,
                imageCount: photos.length
            };
        });

        data.subCategories = await Promise.all(subCategoryPromises);
        data.eventNumber = eventNumber
        if(!data.mainCategoryImage) {
            data.mainCategoryImage = data.subCategories[0].image;
        }
        
        return successResponse(res, data, 'Data fetched successfully');
    } catch (error) {
        console.error('Album data fetch error:', error);
        return errorResponse(res, 'Error fetching album data');
    }
}