// POST /youtube — Get YouTube video details
app.post('/youtube', async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      return res.status(400).json({ error: 'Invalid or missing YouTube URL.' });
    }

    // Extract the video ID
    let videoId;
    const url = new URL(videoUrl);
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1);
    } else {
      videoId = url.searchParams.get('v');
    }

    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID.' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
    const response = await fetch(youtubeUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found or private.' });
    }

    const video = data.items[0];
    const { title, description, thumbnails } = video.snippet;
    const stats = video.statistics;

    const videoDetails = {
      videoId,
      title,
      description,
      thumbnails,
      views: stats?.viewCount || 'N/A',
      likes: stats?.likeCount || 'N/A',
      publishedAt: video.snippet.publishedAt
    };

    res.json({ video: videoDetails });
  } catch (error) {
    console.error('🛑 YouTube API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch video details' });
  }
});
