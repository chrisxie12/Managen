const supabase = require('../config/db');

async function uploadToSpaces(buffer, filename, contentType = 'application/pdf') {
    const { data, error } = await supabase.storage
        .from('report-cards')
        .upload(filename, buffer, {
            contentType: contentType,
            upsert: true
        });

    if (error) {
        // If the bucket doesn't exist, we might get an error. In a real scenario, make sure the bucket exists.
        throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('report-cards')
        .getPublicUrl(filename);

    return publicUrlData.publicUrl;
}

module.exports = { uploadToSpaces };
