import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

function PrivacyPolicy() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="24" height="24" rx="6" fill="#6366f1" />
              <path d="M12 12l8 4-8 4V12z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Typography variant="h6" sx={{ ml: 2, fontSize: '1.25rem', fontWeight: 700, color: theme.palette.text.primary }}>
              AccessAudit
            </Typography>
          </Box>
        </Link>

        <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 700, mb: 6, color: theme.palette.text.primary }}>
          隐私政策
        </Typography>

        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 8, fontSize: '1.125rem' }}>
          最后更新: 2026年7月25日
        </Typography>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            1. 引言
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            本隐私政策解释了 AccessAudit（"我们"、"我们的"）在您使用我们的网站、Web 应用、API 及相关服务（"服务"）时如何收集、使用和分享您的个人信息。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            2. 我们收集的信息
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            我们可能收集以下类型的信息：
          </Typography>
          <ul>
            {[
              '账户信息：创建账户时，我们收集您的姓名、电子邮件地址和密码（已哈希处理）。',
              '使用信息：我们收集关于您如何使用我们服务的信息，包括扫描历史、API 使用和功能使用情况。',
              '设备信息：我们收集关于您用于访问我们服务的设备的信息，包括 IP 地址、浏览器类型和操作系统。',
              '扫描数据：当您运行无障碍扫描时，我们可能收集 URL、页面内容和扫描结果，以提供服务。',
            ].map((item, index) => (
              <li key={index}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, lineHeight: 1.8, pl: 2 }}>
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            3. 我们如何使用您的信息
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            我们使用您的信息来：
          </Typography>
          <ul>
            {[
              '提供和维护我们的服务。',
              '处理您的请求并提供客户支持。',
              '通过分析和测试改进我们的服务。',
              '向您发送重要更新和通知。',
              '遵守法律义务。',
            ].map((item, index) => (
              <li key={index}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, lineHeight: 1.8, pl: 2 }}>
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            4. 数据安全
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            我们采取合理措施保护您的信息免受未经授权的访问、使用或披露。但是，没有任何互联网传输方法或电子存储方法是 100% 安全的。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            5. 第三方服务
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            我们可能使用第三方服务来帮助运营我们的服务。这些服务可能有自己的隐私政策，规定他们如何处理您的信息。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            6. 您的权利
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            根据您的位置，您可能有权：
          </Typography>
          <ul>
            {[
              '访问您的个人信息。',
              '更正不准确的个人信息。',
              '删除您的个人信息。',
              '限制或反对处理您的个人信息。',
              '撤回您的同意。',
            ].map((item, index) => (
              <li key={index}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, lineHeight: 1.8, pl: 2 }}>
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            7. 儿童隐私
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            我们的服务不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人信息。如果您是家长或监护人，并且认为您的孩子向我们提供了个人信息，请联系我们。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            8. 隐私政策变更
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            我们可能不时更新本隐私政策。我们将通过在我们的网站上发布新的隐私政策来通知您任何变更。在新隐私政策生效日期后，您继续使用服务即表示您接受变更。
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            9. 联系我们
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            如果您对本隐私政策有任何疑问，请通过 privacy@accessaudit.com 联系我们。
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default PrivacyPolicy;