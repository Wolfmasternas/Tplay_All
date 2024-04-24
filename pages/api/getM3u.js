import fetch from "cross-fetch";

// Function to fetch the HMAC value
const getHmacValue = async () => {
    try {
        const response = await fetch("https://tplayapi.code-crafters.app/321codecrafters/hmac.json");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data.hmac.hdtl.value;
    } catch (error) {
        console.error('Error fetching and rearranging HMAC data:', error);
        return null;
    }
};

// Function to fetch all channels
const getAllChans = async () => {
    try {
        const response = await fetch("https://ts-api.videoready.tv/content-detail/pub/api/v1/channels?limit=1000");
        const data = await response.json();
        return { list: data.data.list, err: null };
    } catch (error) {
        console.error('Error fetching channels:', error);
        return { list: null, err: error };
    }
};

// Function to fetch user channel details
const getUserChanDetails = async (userChannels) => {
    let hmacValue;
    let obj = { err: null, list: [] };

    try {
        hmacValue = await getHmacValue();
    } catch (error) {
        console.error('Error fetching HMAC value:', error);
        obj.err = error;
        return obj;
    }

    while (userChannels.length > 0) {
        const chanIdsStr = userChannels.splice(0, 999).map(x => x.id).join(',');
        try {
            const response = await fetch("https://tplayapi.code-crafters.app/321codecrafters/fetcher.json");
            const cData = await response.json();

            if (cData && cData.data && Array.isArray(cData.data.channels)) {
                const flatChannels = cData.data.channels.flat();
                flatChannels.forEach(channel => {
                    let rearrangedChannel = {
                        id: channel.id,
                        name: channel.name,
                        tvg_id: channel.tvg_id,
                        group_title: channel.category,
                        tvg_logo: channel.logo_url,
                        stream_url: channel.manifest_url,
                        license_url: channel.license_url,
                        stream_headers: channel.stream_headers,
                        drm: channel.drm,
                        is_mpd: channel.is_mpd,
                        kid_in_mpd: channel.kid_in_mpd,
                        hmac_required: channel.hmac_required,
                        key_extracted: channel.key_extracted,
                        pssh: channel.pssh,
                        clearkey: channel.clearkeys ? JSON.stringify(channel.clearkeys[0].base64) : null,
                        hma: hmacValue
                    };
                    obj.list.push(rearrangedChannel);
                });
            } else {
                console.error('Invalid data structure or channels is not an array:', cData);
import fetch from "cross-fetch";

// Function to fetch the HMAC value
const getHmacValue = async () => {
    try {
        const response = await fetch("https://tplayapi.code-crafters.app/321codecrafters/hmac.json");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data.hmac.hdtl.value;
    } catch (error) {
        console.error('Error fetching and rearranging HMAC data:', error);
        return null;
    }
};

// Function to fetch all channels
const getAllChans = async () => {
    try {
        const response = await fetch("https://ts-api.videoready.tv/content-detail/pub/api/v1/channels?limit=1000");
        const data = await response.json();
        return { list: data.data.list, err: null };
    } catch (error) {
        console.error('Error fetching channels:', error);
        return { list: null, err: error };
    }
};

// Function to fetch user channel details
const getUserChanDetails = async (userChannels) => {
    let hmacValue;
    let obj = { err: null, list: [] };

    try {
        hmacValue = await getHmacValue();
    } catch (error) {
        console.error('Error fetching HMAC value:', error);
        obj.err = error;
        return obj;
    }

    while (userChannels.length > 0) {
        const chanIdsStr = userChannels.splice(0, 999).map(x => x.id).join(',');
        try {
            const response = await fetch("https://tplayapi.code-crafters.app/321codecrafters/fetcher.json");
            const cData = await response.json();

            if (cData && cData.data && Array.isArray(cData.data.channels)) {
                const flatChannels = cData.data.channels.flat();
                flatChannels.forEach(channel => {
                    let rearrangedChannel = {
                        id: channel.id,
                        name: channel.name,
                        tvg_id: channel.tvg_id,
                        group_title: channel.category,
                        tvg_logo: channel.logo_url,
                        stream_url: channel.manifest_url,
                        license_url: channel.license_url,
                        stream_headers: channel.stream_headers,
                        drm: channel.drm,
                        is_mpd: channel.is_mpd,
                        kid_in_mpd: channel.kid_in_mpd,
                        hmac_required: channel.hmac_required,
                        key_extracted: channel.key_extracted,
                        pssh: channel.pssh,
                        clearkey: channel.clearkeys ? JSON.stringify(channel.clearkeys[0].base64) : null,
                        hma: hmacValue
                    };
                    obj.list.push(rearrangedChannel);
                });
            } else {
                console.error('Invalid data structure or channels is not an array:', cData);
                obj.err = 'Invalid data structure';
                return obj;
            }
        } catch (error) {
            console.error('Fetch error:', error);
            obj.err = error;
            return obj;
        }
    }

    return obj;
};

// Function to generate m3u string
const generateM3u = async () => {
    let m3uStr = ''; // Declare m3uStr outside of the block
    let allChans = await getAllChans();

    if (allChans.err) {
        return "Could not get channels. Try again later.";
    }

    let userChanDetails = await getUserChanDetails(allChans.list);

    if (userChanDetails.err === null) {
        let chansList = userChanDetails.list;

        m3uStr = '#EXTM3U x-tvg-url="https://github.com/mitthu786/tvepg/blob/main/tataplay/epg.xml.gz"\n\n';

        for (let i = 0; i < chansList.length; i++) {
            m3uStr += '#EXTINF:-1 tvg-id="' + chansList[i].id.toString() + '" ';
            m3uStr += 'group-title="' + chansList[i].group_title + '", tvg-logo="' + chansList[i].tvg_logo + '", ' + chansList[i].name + '\n';
            m3uStr += '#KODIPROP:inputstream.adaptive.license_type=clearkey\n';
            m3uStr += '#KODIPROP:inputstream.adaptive.license_key=' + chansList[i].clearkey + '\n';
            m3uStr += chansList[i].stream_url + '?' + chansList[i].hma + '\n\n';
        }

        console.log('all done!');
    } else {
        m3uStr = userChanDetails.err ? userChanDetails.err.toString() : "Could not get channels. Try again later.";
    }

    return m3uStr;
};

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function handler(req, res) {
    let m3uString = await generateM3u();
    res.status(200).send(m3uString);
}
￼Enter
