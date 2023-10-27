import React, { useState } from 'react'
import { createBrowserHistory } from 'history'
import './SearchBar.css'

let history = createBrowserHistory();

type Props = {
    children?: any,
    placeholder?: string
    history?: any,
};

export default function SearchBar(props: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const onSearchChange = (event: any) => {
    setSearchQuery(event.target.value);
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();

    history.push(`/docs/search?query=${searchQuery}`);
    history.go(1);

    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="search-container">
        <input onChange={onSearchChange} className="search-bar" placeholder={props.placeholder}></input>
      </div>
    </form>
  )
}