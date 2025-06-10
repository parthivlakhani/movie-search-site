import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

// Add this style block for backdrop layering
const style = `
.movie-details-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #0F0D23;
  box-shadow: 0px 12px 32px 0px #CECEFB05 inset;
  box-shadow: 0px 0px 100px 0px #AB8BFF4D;
}
.movie-details-wrapper > .absolute {
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
}
.movie-info {
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
}
`;

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/movie/${id}?language=en-US`, API_OPTIONS);
        if (!response.ok) throw new Error('Failed to fetch movie details');
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!movie) return null;

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <style>{style}</style>
      <div className="relative movie-details-wrapper rounded-2xl">
        {/* Main Content */}
        <div className="relative z-10 movie-details text-white max-w-6xl mx-auto p-6">
          <div className="flex flex-col md:flex-row gap-8 bg-[#0F0D23] rounded-2xl p-8">
            <div className="w-full md:w-1/3">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '/no-movie.png'}
                alt={movie.title}
                className="rounded-2xl w-full h-auto object-contain shadow-2xl"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-light-200 italic mb-4">"{movie.tagline}"</p>
              )}
              
              <div className="movie-info text-[#D6C7FF] mb-6">
                <span>{new Date(movie.release_date).getFullYear()}</span>
                <span className="mx-2">•</span>
                <span>{movie.runtime} min</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{movie.original_language}</span>
              </div>

              {/* Release Date Section */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-[#A8B5DB]">
                  {movie.release_date ? (
                    (() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const releaseDate = new Date(movie.release_date);
                      releaseDate.setHours(0, 0, 0, 0);
                      return releaseDate <= today ? 'Released' : 'Release Date';
                    })()
                  ) : 'Release Date'}
                </h2>
                <p className="text-[#D6C7FF]">
                  {new Date(movie.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Rating with Star SVG */}
              <div className="flex items-center gap-2 mb-4 bg-dark-100/70 px-3 py-2 rounded-lg shadow">
                <img src="/Star.svg" alt="Star" className="w-6 h-6 mr-1" />
                <span className="font-bold text-lg text-[#D6C7FF]">{movie.vote_average?.toFixed(1)}</span>
                <span className="text-[#D6C7FF] text-sm">({movie.vote_count} votes)</span>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-[#A8B5DB]">Overview</h2>
                  <p className="text-[#FFFFFF]">{movie.overview}</p>
                </div>

                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold text-[#A8B5DB] min-w-[100px]">Genres</h2>
                  <div className="flex flex-wrap gap-4 ml-4">
                    {movie.genres?.map((genre) => (
                      <span key={genre.id} className="bg-[#22123A] px-6 py-2 rounded-xl text-base font-bold text-white text-center">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-[#A8B5DB]">Budget</h2>
                    <p className="text-[#D6C7FF]">{formatCurrency(movie.budget)}</p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-[#A8B5DB]">Revenue</h2>
                    <p className="text-[#D6C7FF]">{formatCurrency(movie.revenue)}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 text-[#A8B5DB]">Production Companies</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.production_companies?.map((company) => (
                      <span key={company.id} className="bg-light-100/10 px-2 py-1 rounded text-xs font-medium text-[#D6C7FF]">
                        {company.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 text-[#A8B5DB]">Production Countries</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.production_countries?.map((country) => (
                      <span key={country.iso_3166_1} className="bg-light-100/10 px-2 py-1 rounded text-xs font-medium text-[#D6C7FF]">
                        {country.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieDetails; 