using System.Web;

namespace TrekkingStore.API.Services
{
    public interface IVietQrService
    {
        string GenerateVietQrUrl(decimal amount, string orderCode);
    }

    public class VietQrService : IVietQrService
    {
        private readonly IConfiguration _config;

        public VietQrService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateVietQrUrl(decimal amount, string orderCode)
        {
            var bankCode = _config["StoreSettings:BankCode"] ?? "MB";
            var accountNumber = _config["StoreSettings:AccountNumber"] ?? "0987654321";
            var accountName = _config["StoreSettings:AccountName"] ?? "TREKKING STORE VIETNAM";

            var encodedAccountName = HttpUtility.UrlEncode(accountName);
            var encodedInfo = HttpUtility.UrlEncode($"THANH TOAN DON {orderCode}");
            var amountInt = (long)amount;

            // Template "compact2" or "qr_only" or "print"
            return $"https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact2.png?amount={amountInt}&addInfo={encodedInfo}&accountName={encodedAccountName}";
        }
    }
}

