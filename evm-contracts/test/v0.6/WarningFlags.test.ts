import {
  contract,
  helpers as h,
  matchers,
  setup,
} from '@chainlink/test-helpers'
import { assert } from 'chai'
//import { ethers } from 'ethers'
import { WarningFlagsFactory } from '../../ethers/v0.6/WarningFlagsFactory'

const provider = setup.provider()
const warningFlagsFactory = new WarningFlagsFactory()
let personas: setup.Personas

beforeAll(async () => {
  personas = (await setup.users(provider)).personas
})

describe('WarningFlags', () => {
  let warningFlags: contract.Instance<WarningFlagsFactory>
  let questionable: string
  const deployment = setup.snapshot(provider, async () => {
    warningFlags = await warningFlagsFactory.connect(personas.Nelly).deploy()
  })

  beforeEach(async () => {
    await deployment()
    questionable = personas.Norbert.address
  })

  it('has a limited public interface', () => {
    matchers.publicAbi(warningFlags, [
      'getWarningFlag',
      'setWarningFlagOff',
      'setWarningFlagOn',
      // Ownable methods:
      'acceptOwnership',
      'owner',
      'transferOwnership',
    ])
  })

  describe('#setWarningFlagOn', () => {
    describe('when called by the owner', () => {
      it('updates the warning flag', async () => {
        assert.equal(false, await warningFlags.getWarningFlag(questionable))

        await warningFlags
          .connect(personas.Nelly)
          .setWarningFlagOn(questionable)

        assert.equal(true, await warningFlags.getWarningFlag(questionable))
      })

      it('emits an event log', async () => {
        const tx = await warningFlags
          .connect(personas.Nelly)
          .setWarningFlagOn(questionable)
        const receipt = await tx.wait()

        const event = matchers.eventExists(
          receipt,
          warningFlags.interface.events.WarningFlagOn,
        )
        assert.equal(questionable, h.eventArgs(event).subject)
      })
      describe('if a flag has already been raised', () => {
        beforeEach(async () => {
          await warningFlags
            .connect(personas.Nelly)
            .setWarningFlagOn(questionable)
        })

        it('emits an event log', async () => {
          const tx = await warningFlags
            .connect(personas.Nelly)
            .setWarningFlagOn(questionable)
          const receipt = await tx.wait()
          assert.equal(0, receipt.events?.length)
        })
      })
    })

    describe('when called by a non-owner', () => {
      it('updates the warning flag', async () => {
        await matchers.evmRevert(
          warningFlags.connect(personas.Neil).setWarningFlagOn(questionable),
          'Only callable by owner',
        )
      })
    })
  })

  describe('#setWarningFlagOff', () => {
    beforeEach(async () => {
      await warningFlags.connect(personas.Nelly).setWarningFlagOn(questionable)
    })

    describe('when called by the owner', () => {
      it('updates the warning flag', async () => {
        assert.equal(true, await warningFlags.getWarningFlag(questionable))

        await warningFlags
          .connect(personas.Nelly)
          .setWarningFlagOff(questionable)

        assert.equal(false, await warningFlags.getWarningFlag(questionable))
      })

      it('emits an event log', async () => {
        const tx = await warningFlags
          .connect(personas.Nelly)
          .setWarningFlagOff(questionable)
        const receipt = await tx.wait()

        const event = matchers.eventExists(
          receipt,
          warningFlags.interface.events.WarningFlagOff,
        )
        assert.equal(questionable, h.eventArgs(event).subject)
      })
      describe('if a flag has already been raised', () => {
        beforeEach(async () => {
          await warningFlags
            .connect(personas.Nelly)
            .setWarningFlagOff(questionable)
        })

        it('emits an event log', async () => {
          const tx = await warningFlags
            .connect(personas.Nelly)
            .setWarningFlagOff(questionable)
          const receipt = await tx.wait()
          assert.equal(0, receipt.events?.length)
        })
      })
    })

    describe('when called by a non-owner', () => {
      it('updates the warning flag', async () => {
        await matchers.evmRevert(
          warningFlags.connect(personas.Neil).setWarningFlagOff(questionable),
          'Only callable by owner',
        )
      })
    })
  })
})
