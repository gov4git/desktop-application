import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import type { Community } from '../../../../../../electron/db/schema.js'
import { Loader } from '../../../../components/Loader.js'
import { useDataStore } from '../../../../store/store.js'
import { useCommunityTableStyle } from './CommunityTable.styles.js'

export const CommunityTable: FC = function CommunityTable() {
  const communities = useDataStore((s) => s.communityInfo.communities)
  const communitiesLoading = useDataStore((s) => s.communityInfo.loading)
  const selectedCommunity = useDataStore(
    (s) => s.communityInfo.selectedCommunity,
  )
  const [selectedCommunityUrl, setSelectedCommunityUrl] = useState(
    selectedCommunity?.url ?? '',
  )
  const [communityPages, setCommunityPages] = useState<Record<string, string>>(
    {},
  )
  const styles = useCommunityTableStyle()
  const _selectCommunity = useDataStore((s) => s.communityInfo.selectCommunity)

  const selectCommunity = useCallback(
    async (url: string) => {
      setSelectedCommunityUrl(url)
      await _selectCommunity(url)
    },
    [_selectCommunity, setSelectedCommunityUrl],
  )

  useEffect(() => {
    setSelectedCommunityUrl(selectedCommunity?.url ?? '')
  }, [selectedCommunity, setSelectedCommunityUrl])

  useEffect(() => {
    if (communities != null) {
      for (const c of communities) {
        const l = `<a href="${c.projectUrl}" target="_blank">${c.name}</a>`
        setCommunityPages((p) => {
          return {
            ...p,
            [c.url]: l,
          }
        })
      }
    }
  }, [communities, setCommunityPages])

  return (
    <Loader isLoading={communitiesLoading}>
      {communities != null && communities.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell className={styles.firstCol}></TableHeaderCell>
              <TableHeaderCell>Community</TableHeaderCell>
              <TableHeaderCell>Membership Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {communities.map((c) => (
              <TableRow key={c.url}>
                <TableCell className={styles.firstCol}>
                  <Checkbox
                    disabled={!c.isMember}
                    checked={c.url === selectedCommunityUrl}
                    onChange={() => selectCommunity(c.url)}
                  />
                </TableCell>
                <TableCell>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: communityPages[c.url] ?? '',
                    }}
                  ></span>
                </TableCell>
                <TableCell>
                  <CommunityMembershipStatus community={c} />
                </TableCell>
                <TableCell>
                  <CommunityAction community={c} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Loader>
  )
}

type CommunityMembersipStatusProps = {
  community: Community
}

const CommunityMembershipStatus: FC<CommunityMembersipStatusProps> =
  function CommunityMembershipStatus({ community }) {
    const message = useMemo(() => {
      if (community.isMaintainer) {
        return 'Admin'
      } else if (community.isMember) {
        return 'Member'
      } else if (
        community.joinRequestStatus != null &&
        community.joinRequestStatus === 'open'
      ) {
        return 'Pending'
      } else if (
        community.joinRequestStatus != null &&
        community.joinRequestStatus === 'closed'
      ) {
        return 'Denied'
      } else {
        return 'Not Available'
      }
    }, [community])

    return <>{message}</>
  }

const CommunityAction: FC<CommunityMembersipStatusProps> =
  function CommunityAction({ community }) {
    const setCommunityDashboardState = useDataStore(
      (s) => s.communityDashboard.setState,
    )
    const setManagedCommunity = useDataStore(
      (s) => s.communityManage.setCommunity,
    )

    const manage = useCallback(() => {
      setManagedCommunity(community)
      setCommunityDashboardState('manage')
    }, [setCommunityDashboardState, setManagedCommunity, community])

    // if (community.isMaintainer) {
    //   return <Button onClick={manage}>Manage</Button>
    // }

    if (
      !community.isMaintainer &&
      !community.isMember &&
      community.joinRequestUrl != null &&
      community.joinRequestUrl !== ''
    ) {
      return (
        <a href={community.joinRequestUrl!} target="_blank" rel="noreferrer">
          View Request
        </a>
      )
    }

    return <></>
  }
