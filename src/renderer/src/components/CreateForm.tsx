import {
  Button,
  Card,
  Combobox,
  Field,
  Input,
  Option,
  Textarea,
} from '@fluentui/react-components'
import { FormEvent, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createNestedRecord, mergeDeep } from '~/shared'

import { routes } from '../App/index.js'
import { useCatchError } from '../hooks/useCatchError.js'
import { ballotService } from '../services/BallotService.js'
import { useButtonStyles } from '../styles/index.js'
import { useSettingsFormsStyles } from './SettingsForm.styles.js'

export const CreateForm = function CreateForm() {
  const styles = useSettingsFormsStyles()
  const catchError = useCatchError()
  const buttonStyles = useButtonStyles()
  const navigate = useNavigate()
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [form, setForm] = useState({
    type: 'issues',
    title: '',
    description: '',
  })

  const updateForm = useCallback(
    (key: string, value: string) => {
      setUnsavedChanges(true)
      const obj = createNestedRecord({
        [key]: value,
      })
      setForm((c) => {
        return mergeDeep({}, c, obj)
      })
    },
    [setForm, setUnsavedChanges],
  )

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      try {
        await ballotService.createBallot(form)
        setForm({
          type: 'Issues',
          title: '',
          description: '',
        })
        setUnsavedChanges(false)
        navigate(routes.issues.path)
      } catch (ex) {
        await catchError(`Unable to save config. ${ex}`)
      }
    },
    [navigate, form, setForm, setUnsavedChanges, catchError],
  )

  const reset = useCallback(() => {
    setForm({
      type: 'issues',
      title: '',
      description: '',
    })
    setUnsavedChanges(false)
    navigate(routes.issues.path)
  }, [setForm, setUnsavedChanges, navigate])

  return (
    <Card className={styles.card}>
      <form onSubmit={save}>
        <Field className={styles.field} label="Type">
          <Combobox
            defaultValue="Issues"
            defaultSelectedOptions={['issues']}
            onOptionSelect={(ev, data) =>
              updateForm('type', data.optionValue ?? '')
            }
          >
            <Option value="issues">Issues</Option>
            <Option value="pull">Pull Requests</Option>
          </Combobox>
        </Field>
        <Field className={styles.field} label="Title">
          <Input
            type="text"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
          />
        </Field>
        <Field className={styles.field} label="Description">
          <Textarea
            value={form.description}
            resize="vertical"
            size="large"
            onChange={(e) => updateForm('description', e.target.value)}
          />
        </Field>

        <div className={styles.buttons}>
          <Button shape="circular" onClick={reset}>
            Cancel
          </Button>
          <Button
            shape="circular"
            type="submit"
            disabled={!unsavedChanges}
            className={buttonStyles.primary}
          >
            Save
          </Button>
        </div>
      </form>
    </Card>
  )
}
