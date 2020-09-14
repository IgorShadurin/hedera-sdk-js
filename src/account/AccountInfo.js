import AccountId from "./AccountId";
import LiveHash from "./LiveHash";
import proto from "@hashgraph/proto";
import Hbar from "../Hbar";
import Time from "../Timestamp";
import { _fromProtoKey, _toProtoKey } from "../util";
import { Key } from "@hashgraph/cryptography";
import Long from "long";

/**
 * Current information about an account, including the balance.
 */
export default class AccountInfo {
    /**
     * @private
     * @param {object} props
     * @param {AccountId} props.accountId
     * @param {?string} props.contractAccountId
     * @param {boolean} props.isDeleted
     * @param {?AccountId} props.proxyAccountId
     * @param {Hbar} props.proxyReceived
     * @param {Key} props.key
     * @param {Hbar} props.balance
     * @param {Hbar} props.sendRecordThreshold
     * @param {Hbar} props.receiveRecordThreshold
     * @param {boolean} props.isReceiverSignatureRequired
     * @param {Time} props.expirationTime
     * @param {Long} props.autoRenewPeriod
     * @param {LiveHash[]} props.liveHashes
     */
    constructor(props) {
        /**
         * The account ID for which this information applies.
         *
         * @readonly
         */
        this.accountId = props.accountId;

        /**
         * The Contract Account ID comprising of both the contract instance and the cryptocurrency
         * account owned by the contract instance, in the format used by Solidity.
         *
         * @readonly
         */
        this.contractAccountId = props.contractAccountId;

        /**
         * If true, then this account has been deleted, it will disappear when it expires, and
         * all transactions for it will fail except the transaction to extend its expiration date.
         *
         * @readonly
         */
        this.isDeleted = props.isDeleted;

        /**
         * The Account ID of the account to which this is proxy staked. If proxyAccountID is null,
         * or is an invalid account, or is an account that isn't a node, then this account is
         * automatically proxy staked to a node chosen by the network, but without earning payments.
         * If the proxyAccountID account refuses to accept proxy staking , or if it is not currently
         * running a node, then it will behave as if proxyAccountID was null.
         *
         * @readonly
         */
        this.proxyAccountId = props.proxyAccountId;

        /**
         * The total number of tinybars proxy staked to this account.
         *
         * @readonly
         */
        this.proxyReceived = props.proxyReceived;

        /**
         * The key for the account, which must sign in order to transfer out, or to modify the account
         * in any way other than extending its expiration date.
         *
         * @readonly
         */
        this.key = props.key;

        /**
         * The current balance of account.
         *
         * @readonly
         */
        this.balance = props.balance;

        /**
         * The threshold amount (in tinybars) for which an account record is created (and this account
         * charged for them) for any send/withdraw transaction.
         *
         * @readonly
         */
        this.sendRecordThreshold = props.sendRecordThreshold;

        /**
         * The threshold amount (in tinybars) for which an account record is created
         * (and this account charged for them) for any transaction above this amount.
         *
         * @readonly
         */
        this.receiveRecordThreshold = props.receiveRecordThreshold;

        /**
         * If true, no transaction can transfer to this account unless signed by this account's key.
         *
         * @readonly
         */
        this.isReceiverSignatureRequired = props.isReceiverSignatureRequired;

        /**
         * The TimeStamp time at which this account is set to expire.
         *
         * @readonly
         */
        this.expirationTime = props.expirationTime;

        /**
         * The duration for expiration time will extend every this many seconds. If there are
         * insufficient funds, then it extends as long as possible. If it is empty when it
         * expires, then it is deleted.
         *
         * @readonly
         */
        this.autoRenewPeriod = props.autoRenewPeriod;

        /** @readonly */
        this.liveHashes = props.liveHashes;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.CryptoGetInfoResponse.IAccountInfo} info
     */
    static _fromProtobuf(info) {
        return new AccountInfo({
            accountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (info.accountID)
            ),
            contractAccountId:
                info.contractAccountID != null ? info.contractAccountID : null,
            isDeleted: info.deleted != null ? info.deleted : false,
            key: _fromProtoKey(/** @type {proto.IKey} */ (info.key)),
            balance: Hbar.fromTinybars(info.balance != null ? info.balance : 0),
            sendRecordThreshold: Hbar.fromTinybars(
                info.generateSendRecordThreshold != null
                    ? info.generateSendRecordThreshold
                    : 0
            ),
            receiveRecordThreshold: Hbar.fromTinybars(
                info.generateReceiveRecordThreshold != null
                    ? info.generateReceiveRecordThreshold
                    : 0
            ),
            isReceiverSignatureRequired:
                info.receiverSigRequired != null
                    ? info.receiverSigRequired
                    : false,
            expirationTime: Time._fromProtobuf(
                /** @type {proto.ITimestamp} */ (info.expirationTime)
            ),
            autoRenewPeriod:
                info.autoRenewPeriod?.seconds instanceof Long
                    ? info.autoRenewPeriod.seconds
                    : Long.fromValue(
                          info.autoRenewPeriod != null
                              ? info.autoRenewPeriod.seconds != null
                                  ? info.autoRenewPeriod.seconds
                                  : 0
                              : 0
                      ),
            proxyAccountId:
                info.proxyAccountID != null
                    ? AccountId._fromProtobuf(info.proxyAccountID)
                    : null,
            proxyReceived: Hbar.fromTinybars(
                info.proxyReceived != null ? info.proxyReceived : 0
            ),
            liveHashes: (info.liveHashes != null
                ? info.liveHashes
                : []
            ).map((hash) => LiveHash._fromProtobuf(hash)),
        });
    }

    /**
     * @returns {proto.CryptoGetInfoResponse.IAccountInfo}
     */
    _toProtobuf() {
        return {
            accountID: this.accountId._toProtobuf(),
            contractAccountID: this.contractAccountId,
            deleted: this.isDeleted,
            proxyAccountID: this.proxyAccountId?._toProtobuf(),
            proxyReceived: this.proxyReceived.toTinybars(),
            key: _toProtoKey(this.key),
            balance: this.balance.toTinybars(),
            generateSendRecordThreshold: this.sendRecordThreshold.toTinybars(),
            generateReceiveRecordThreshold: this.receiveRecordThreshold.toTinybars(),
            receiverSigRequired: this.isReceiverSignatureRequired,
            expirationTime: this.expirationTime._toProtobuf(),
            autoRenewPeriod: {
                seconds: this.autoRenewPeriod,
            },
            liveHashes: this.liveHashes.map((hash) => hash._toProtobuf()),
        };
    }
}