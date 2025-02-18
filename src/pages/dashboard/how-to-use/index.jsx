import React from 'react';

const HowToUse = () => {
    return (
        <div className="min-h-[calc(100vh-280px)] flex items-center justify-center">
            <div className="w-full h-[calc(100vh-280px)] px-4 sm:px-6 py-8 flex justify-center items-center">
                <iframe
                    className="sm:w-3/4 h-full"
                    src="https://www.youtube.com/embed/-T__YWoq45I?si=jvpZSIdbmLTTduv8"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default HowToUse;
