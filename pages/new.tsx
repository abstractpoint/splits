import React, { useEffect } from 'react'
import {
  useForm,
  useFieldArray,
  useWatch,
  Control,
  UseFormSetValue,
  UseFormRegister,
} from 'react-hook-form'
import Link from 'next/link'
import Title from 'components/Title'
import Layout from 'components/Layout'
import Button from 'components/Button'
import Menu from 'components/Menu'
import ProgressBar from 'components/ProgressBar'
import { round, sumBy, endsWith, isEmpty } from 'lodash'

import { useEthers, shortenAddress } from '@usedapp/core'
import { isAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'

type IRecipient = {
  address: string
  ownership?: number
  ens?: string
  resolvedAddress?: string
}

type IRecipients = {
  recipients: IRecipient[]
}

export default function NewSplit(): JSX.Element {
  const { library } = useEthers()
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<IRecipients>({
    mode: 'onBlur',
    defaultValues: {
      recipients: [
        { address: '', ownership: 0 },
        { address: '', ownership: 0 },
      ],
    },
  })
  const { fields, append, remove } = useFieldArray({
    name: 'recipients',
    control,
  })

  const recipients: IRecipient[] = useWatch({
    control,
    name: `recipients`,
  })
  const totalAllocated = sumBy(recipients, (o) => o.ownership || 0)

  const lookupAddress = async (address: string) =>
    await library?.lookupAddress(address)
  const lookupENS = async (ens: string) => await library?.resolveName(ens)

  // eslint-disable-next-line no-console
  const onSubmit = (data: IRecipients) => console.log(data)

  // Determine number of recipients and set ownership equal among all.
  const splitEqually = () => {
    const num = fields.length
    fields.forEach((_, index) => {
      return setValue(`recipients.${index}.ownership`, round(100 / num, 1), {
        shouldValidate: true,
      })
    })
  }

  // Determine amount remaining and split equally among all recipients.
  const splitRemaining = () => {
    const num = fields.length
    const remaining = 100 - totalAllocated
    fields.forEach((_, index) => {
      const currentValue = getValues(`recipients.${index}.ownership`) || 0
      return setValue(
        `recipients.${index}.ownership`,
        currentValue + round(remaining / num, 1),
        {
          shouldValidate: true,
        },
      )
    })
  }

  // Get contents from clipboard and paste into focused address field.
  // async function paste(index: number) {
  //   const value = await navigator.clipboard.readText()
  //   setValue(`recipients.${index}.address`, value, {
  //     shouldValidate: true,
  //   })
  // }

  // Split can be created if: no errors, 2+ recipients, ownership allocated is 100%.
  const isComplete =
    isEmpty(errors) && fields.length >= 2 && totalAllocated === 100

  // TODO: AD validate, convert ownership properly
  return (
    <Layout>
      <Title value="New Split | Splits" />
      <Menu />
      <div className={'py-4 space-y-4'}>
        <Link href={'/'}>
          <a
            className={
              'font-semibold text-lg text-gray-400 hover:text-gray-600 transition'
            }
          >
            &larr; Back
          </a>
        </Link>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={'w-full'}
          autoComplete={'off'}
        >
          <div className={'flex items-center justify-between mb-4 '}>
            <div className={'text-2xl font-medium'}>Recipients</div>
            <div className={'flex items-center'}>
              <button
                type={'button'}
                onClick={() => splitEqually()}
                className={
                  'p-2 bg-gray-500 bg-opacity-5 hover:bg-opacity-10 font-medium text-sm text-gray-500 transition focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-l-lg'
                }
              >
                Split evenly
              </button>
              <button
                type={'button'}
                onClick={() => splitRemaining()}
                className={
                  'p-2 bg-gray-500 bg-opacity-5 hover:bg-opacity-10 font-medium text-sm text-gray-500 transition focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-r-lg'
                }
              >
                Split remaining
              </button>
            </div>
          </div>
          <div className={'space-y-6'}>
            {fields.map((field, index) => (
              <SplitAddressEntry
                key={field.id}
                index={index}
                register={register}
                control={control}
                setValue={setValue}
                errors={errors}
                remove={remove}
                lookupAddress={lookupAddress}
                lookupENS={lookupENS}
                numSplitAddresses={fields.length}
                totalAllocated={totalAllocated}
                // paste={paste}
              />
            ))}
          </div>
          <div className={'py-4'}>
            <ProgressBar
              minLabel={'Allocated'}
              maxLabel={'Remaining'}
              fill={totalAllocated}
              currentAmount={round(totalAllocated, 1)}
              maxAmount={round(100 - totalAllocated, 1)}
              unit={'%'}
              isError={totalAllocated > 100}
            />
          </div>

          <div className={'grid grid-cols-2 gap-4'}>
            <Button
              color={'gray'}
              type={'button'}
              onClick={() => {
                append({ address: '', ownership: 0 })
              }}
            >
              Add Recipient
            </Button>
            <Button
              isDisabled={!isComplete}
              onClick={() => handleSubmit(onSubmit)}
              type={'submit'}
              color={'purple'}
            >
              Create Split
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

const SplitAddressEntry = ({
  index,
  register,
  control,
  errors,
  remove,
  setValue,
  lookupENS,
  lookupAddress,
  totalAllocated,
  numSplitAddresses,
}: // paste,
{
  index: number
  register: UseFormRegister<IRecipients>
  control: Control<IRecipients>
  errors: any // eslint-disable-line
  remove: (index?: number | number[]) => void
  setValue: UseFormSetValue<IRecipients>
  lookupENS: (ens: string) => Promise<string | undefined>
  lookupAddress: (address: string) => Promise<string | undefined>
  totalAllocated: number
  numSplitAddresses: number
  // paste: (index: number) => Promise<void>
}): JSX.Element => {
  const recipient = useWatch({
    control,
    name: `recipients.${index}`,
  })

  useEffect(() => {
    ;(async () => {
      if (endsWith(recipient.address, '.eth')) {
        try {
          // TODO: add loading state
          const address = await lookupENS(recipient.address)
          if (address) {
            setValue(`recipients.${index}`, {
              address: address,
              ens: recipient.address,
              resolvedAddress: address,
            })
          } else {
            // TODO: add some kind of error/validation letting user know search was unsuccessful
            setValue(`recipients.${index}`, {
              address: recipient.address,
              ens: undefined,
              resolvedAddress: undefined,
            })
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
        }
      } else if (
        recipient.address !== recipient.resolvedAddress &&
        isAddress(recipient.address)
      ) {
        // TODO: add loading state
        const ens = await lookupAddress(recipient.address)
        if (!ens && (recipient.ens || recipient.resolvedAddress)) {
          setValue(`recipients.${index}`, {
            address: recipient.address,
            ens: undefined,
            resolvedAddress: undefined,
          })
        } else if (ens != recipient.ens) {
          setValue(`recipients.${index}`, {
            address: recipient.address,
            ens,
            resolvedAddress: recipient.address,
          })
        }
      } else if (!isAddress(recipient.address)) {
        setValue(`recipients.${index}`, {
          address: recipient.address,
          ens: undefined,
          resolvedAddress: undefined,
        })
      }
    })()
  }, [recipient.address])

  // const InputButton = ({
  //   onClick,
  //   value,
  // }: {
  //   onClick: MouseEventHandler
  //   value: string
  // }) => {
  //   return (
  //     <button
  //       type={'button'}
  //       onClick={onClick}
  //       className={
  //         'px-3 py-1.5 rounded-full text-sm uppercase font-semibold bg-gray-100 text-gray-400 hover:text-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-300'
  //       }
  //     >
  //       {value}
  //     </button>
  //   )
  // }

  function AddressInputMessage({
    message,
    isError,
  }: {
    message: string
    isError?: boolean
  }) {
    return (
      <p className={isError ? `text-red-400` : `text-green-400`}>{message}</p>
    )
  }

  return (
    <div className={'space-y-2 '}>
      <div
        className={
          'border border-gray-300 rounded-3xl md:flex items-center text-lg focus-within:border-white focus-within:ring-4 focus-within:ring-purple-200 transition'
        }
      >
        <div
          className={
            'w-full rounded-3xl relative flex items-center font-medium bg-transparent transition focus-within:ring-2 focus-within:ring-purple-500'
          }
        >
          <input
            placeholder={shortenAddress(AddressZero)}
            {...register(`recipients.${index}.address` as const, {
              required: {
                value: true,
                message: 'Required',
              },
              validate: validateAddress,
            })}
            className={`flex-grow bg-transparent py-5 px-4 focus:outline-none`}
          />
          <div
            className={
              'absolute bottom-1 left-4 font-semibold text-sm tracking-wide transition'
            }
          >
            {recipient.ens && <AddressInputMessage message={recipient.ens} />}
            {!recipient.ens && isAddress(recipient.address) && (
              <AddressInputMessage message={'Valid address'} />
            )}
            {errors?.recipients?.[index]?.address &&
              !recipient.ens &&
              !isAddress(recipient.address) && (
                <AddressInputMessage
                  isError
                  message={errors?.recipients?.[index]?.address?.message}
                />
              )}
          </div>
        </div>
        <div
          className={
            'w-full md:w-32 rounded-3xl relative flex items-center font-medium bg-transparent transition focus-within:ring-2 focus-within:ring-purple-500'
          }
        >
          <input
            placeholder={'0.0%'}
            type={'number'}
            step={'0.1'}
            {...register(`recipients.${index}.ownership` as const, {
              valueAsNumber: true,
              required: {
                value: true,
                message: 'Required',
              },
              validate: (value) =>
                (value && value <= 100 - totalAllocated + value) ||
                `Insufficient`,
              max: {
                value: 99.99,
                message: '99.9 max',
              },
              min: {
                value: 0.01,
                message: '0.1 min',
              },
            })}
            className={`w-full flex-1 bg-transparent py-5 px-4 focus:outline-none`}
          />
          <div
            className={
              'absolute bottom-1 left-4 font-semibold text-sm tracking-wide transition'
            }
          >
            {errors?.recipients?.[index]?.ownership && (
              <AddressInputMessage
                isError
                message={errors?.recipients?.[index]?.ownership?.message}
              />
            )}
          </div>
        </div>
        <div className={'p-2 flex justify-end'}>
          <Button
            onClick={() => remove(index)}
            isDisabled={numSplitAddresses <= 2}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}

const validateAddress = async (value: string) => {
  if (isAddress(value)) return true
  try {
    if (endsWith(value, '.eth')) return 'Searching for ENS...'
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
  return 'Invalid address'
}
