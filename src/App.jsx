import { useEffect, useState } from 'react';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method:'GET',
  headers:{
    accept:'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = ()=> {
  let index=1;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [trendingMovies, setTrendingMovies]= useState([]);

  const [upcomingMovies, setUpcomingMovies] = useState([]);

  const [IsLoading, setIsLoading] = useState(false);
  const [debounceSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(()=>setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  useEffect(()=>{
    const fetchTrending = async()=>{
      setIsLoading(true);
      setErrorMessage('');
      try{
        const response = await fetch(`${API_BASE_URL}/trending/movie/day?language=en-US`, API_OPTIONS);
        if(!response.ok) throw new Error('Failed to fetch trending Movies');
        const data = await response.json();
        const tenResponses = (data.results || []).slice(0,10);
        setTrendingMovies(tenResponses);
      }catch(error){
        console.error(error);
        setErrorMessage('Failed to load trending movies');
      }finally{
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(()=>{
  const fetchUpcoming = async()=>{
    setIsLoading(true);
    setErrorMessage('');
    try{
      const response = await fetch(`${API_BASE_URL}/movie/upcoming?language=en-US&page=1`, API_OPTIONS);
      if(!response.ok) throw new Error('Failed to fetch Upcoming Movies');
      const data = await response.json();
      setUpcomingMovies(data.results || []);
    }catch(error){
      console.error(error);
      setErrorMessage('Failed to load Upcoming movies');
    }finally{
      setIsLoading(false);
    }
  };
  fetchUpcoming();
}, []);

  useEffect(()=>{

    if(!debounceSearchTerm){
      setSearchResults([]);
      setErrorMessage('');
      return
    }

    const fetchSearch = async ()=>{
      setIsLoading(true);
      setErrorMessage('');
      try {
        
        const response = await fetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(debounceSearchTerm)}`,API_OPTIONS);
        if(!response.ok){
          throw new Error('Failed to search movies');
        }
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error(`Error fetching movies: ${error}`);  
        setErrorMessage('Error fetching movies. Please try again later');  
      }finally{
        setIsLoading(false);
      }
  }

    fetchSearch();

  },[debounceSearchTerm]);

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy without the hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {debounceSearchTerm && (
          <section className='all-movies'>
            <h2 className='mt-[40px]'>Search Results for "{debounceSearchTerm}"</h2>
            {IsLoading ? (
              <Spinner />
            ) : searchResults.length === 0 ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {searchResults.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Trending Movies section */}
        {!debounceSearchTerm && (<section className='trending'>
          <h2>Trending Movies</h2>
          {IsLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {trendingMovies.map((movie)=>(
                <li key={movie.id} >
                  <p>{index++}</p>
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
                </li>
              ))}
            </ul>
          )}
        </section>) }


        {!debounceSearchTerm && (
        <section className='all-movies'>
          <h2 className='mt-[40px]'>Upcoming Movies</h2>
            {IsLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {upcomingMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
        </section>
      )}
      </div>
    </main>
  )
}
export default App