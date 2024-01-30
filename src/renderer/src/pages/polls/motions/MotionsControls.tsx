import { Dropdown, Option, Text } from '@fluentui/react-components'
import { SearchBox } from '@fluentui/react-search-preview'
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { debounceAsync } from '~/shared'

import {
  useMotionsSearchResults,
  useMotionsSearchTerm,
  useMotionsStatus,
  useMotionsVoteStatus,
  useSetMotionsSearchTerm,
  useSetMotionsStatus,
  useSetMotionsVoteStatus,
} from '../../../store/hooks/motionHooks.js'
import { useMotionsControlStyles } from './MotionsControls.styles.js'

export const MotionsControls: FC<PropsWithChildren> = function MotionsControls({
  children,
}) {
  const styles = useMotionsControlStyles()
  const globalSearch = useMotionsSearchTerm()
  const setGlobalSearch = useSetMotionsSearchTerm()
  const [search, setSearch] = useState<string>(globalSearch)
  const globalStatus = useMotionsStatus()
  const setGlobalStatus = useSetMotionsStatus()
  const globalVotedOn = useMotionsVoteStatus()
  const setGlobalVotedOn = useSetMotionsVoteStatus()
  const searchResults = useMotionsSearchResults()
  const StatusOptions = ['Open', 'Closed', 'Cancelled', 'Frozen']
  const VoteStatusOptions = ['Voted', 'Not Voted']

  useEffect(() => {
    setSearch(globalSearch)
  }, [globalSearch, setSearch])

  const debounceSetGlobalSearch = useMemo(() => {
    return debounceAsync(setGlobalSearch)
  }, [setGlobalSearch])

  useEffect(() => {
    debounceSetGlobalSearch(search)
  }, [search, debounceSetGlobalSearch])

  const handleStatusChange = useCallback(
    (ev: any, data: any) => {
      setGlobalStatus(data.selectedOptions)
    },
    [setGlobalStatus],
  )

  const handleVoteStatusChange = useCallback(
    (ev: any, data: any) => {
      setGlobalVotedOn(data.selectedOptions)
    },
    [setGlobalVotedOn],
  )

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <div>
            <SearchBox
              className={styles.searchInput}
              size="medium"
              placeholder="Search"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              dismiss={
                // eslint-disable-next-line
                <i
                  onClick={() => setSearch('')}
                  className="codicon codicon-chrome-close"
                ></i>
              }
            />
          </div>
        </div>
        <div className={styles.controlDropdown}>
          <Dropdown
            multiselect={true}
            placeholder="Status"
            selectedOptions={globalStatus}
            onOptionSelect={handleStatusChange}
          >
            {StatusOptions.map((option) => (
              <Option
                key={option}
                text={option}
                value={option.toLocaleLowerCase()}
              >
                {option}
              </Option>
            ))}
          </Dropdown>
        </div>
        <div className={styles.controlDropdown}>
          <Dropdown
            multiselect={true}
            placeholder="Participation"
            selectedOptions={globalVotedOn}
            onOptionSelect={handleVoteStatusChange}
          >
            {VoteStatusOptions.map((option) => (
              <Option key={option} text={option} value={option}>
                {option}
              </Option>
            ))}
          </Dropdown>
        </div>
      </div>
      <div className={styles.controls}>
        <div>
          <Text>{searchResults.matchingCount} matching results</Text>
        </div>
        <div>{children}</div>
      </div>
    </>
  )
}
