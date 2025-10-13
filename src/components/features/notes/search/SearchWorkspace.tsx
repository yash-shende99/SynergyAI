import { FC } from 'react';
import { NoteSearchResult, Note } from '../../../../types';
import FilterPanel from './FilterPanel';
import SearchResultsPanel from './SearchResultsPanel';
import PreviewPanel from './PreviewPanel';

interface SearchWorkspaceProps {
  onSearch: (query: string) => void;
  results: NoteSearchResult[];
  selectedNote: Note | null;
  onSelectResult: (result: NoteSearchResult) => void;
  isLoading: boolean;
  error: string;
}

const SearchWorkspace: FC<SearchWorkspaceProps> = (props) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[80vh]">
    <div className="md:col-span-3 lg:col-span-2">
      <FilterPanel />
    </div>
    <div className="md:col-span-4 lg:col-span-4">
      <SearchResultsPanel {...props} />
    </div>
    <div className="md:col-span-5 lg:col-span-6">
      <PreviewPanel note={props.selectedNote} />
    </div>
  </div>
);

export default SearchWorkspace;
